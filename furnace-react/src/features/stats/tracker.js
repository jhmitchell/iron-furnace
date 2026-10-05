/**
 * The site's own visit counter (no cookies, no third parties). Sends to /api/v1/stats:
 *
 * - a page view on every page (route) change,
 * - how long each page was actually in use: visible, and not idle for more than 3 minutes,
 *   plus whether the visitor touched, clicked, scrolled or typed (programs that just load
 *   pages never do), sent when they move on or switch away,
 * - clicks on links that leave the site, open a file, or start a call or email.
 *
 * Nothing is stored in the visitor's browser, except a flag in browsers that have signed in
 * to the admin dashboard so staff visits aren't counted. Not sent at all with Do Not Track or
 * Global Privacy Control turned on, or from automated browsers.
 * See backend/app/internal/stats/collect.py for what the server keeps.
 */

const ENDPOINT = '/api/v1/stats';
const IGNORE_KEY = 'cif-stats-ignore';
const IDLE_MS = 3 * 60 * 1000;
const UTM_KEYS = ['source', 'medium', 'campaign'];

const state = {
  view: null, // { id, visibleSince, activeMs, lastInput, interacted }
  notFound: false,
  firstView: true,
  listening: false,
};

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** Staff: stop (or start again) counting visits from this browser. */
export const setIgnoreThisBrowser = (ignore) => {
  try {
    if (ignore) storage()?.setItem(IGNORE_KEY, '1');
    else storage()?.removeItem(IGNORE_KEY);
  } catch {
    // Private mode: nothing to remember
  }
};

export const isBrowserIgnored = () => {
  try {
    return storage()?.getItem(IGNORE_KEY) === '1';
  } catch {
    return false;
  }
};

const optedOut = () =>
  navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;

const automated = () => navigator.webdriver === true || !window.innerWidth;

const enabled = () => typeof window !== 'undefined' && !optedOut() && !automated() && !isBrowserIgnored();

const send = (path, data) => {
  const body = JSON.stringify(data);
  try {
    // text/plain: a "simple" request, so the browser sends it without a preflight
    if (navigator.sendBeacon?.(`${ENDPOINT}/${path}`, body)) return;
  } catch {
    // fall through
  }
  fetch(`${ENDPOINT}/${path}`, { method: 'POST', body, keepalive: true, credentials: 'omit' }).catch(() => {});
};

const randomId = () => {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_');
};

// --- Engaged time -------------------------------------------------------------------------

const visible = () => document.visibilityState === 'visible';

/** Add the time since the last check to the current view, if it was visible and not idle. */
const tally = () => {
  const view = state.view;
  if (!view || view.visibleSince === null) return;
  const now = Date.now();
  // Idle for a long time: only count up to IDLE_MS after the last input
  const until = Math.min(now, Math.max(view.lastInput, view.visibleSince) + IDLE_MS);
  if (until > view.visibleSince) view.activeMs += until - view.visibleSince;
  view.visibleSince = visible() ? now : null;
};

const flush = () => {
  const view = state.view;
  if (!view) return;
  tally();
  if (view.activeMs > 0 || view.interacted) {
    send('engage', { id: view.id, ms: Math.round(view.activeMs), interacted: view.interacted });
  }
};

const onInput = (event) => {
  const view = state.view;
  if (!view) return;
  // The site scrolls to the top itself when the page changes; that isn't the visitor
  if (event.type === 'scroll' && Date.now() - view.startedAt < 1000) return;
  if (view.visibleSince === null && visible()) view.visibleSince = Date.now();
  else tally();
  view.lastInput = Date.now();
  view.interacted = true;
};

const onVisibility = () => {
  if (visible()) {
    if (state.view) {
      state.view.visibleSince = Date.now();
      state.view.lastInput = Date.now();
    }
  } else {
    flush();
  }
};

// --- Clicks -------------------------------------------------------------------------------

const zoneOf = (link) => {
  const marked = link.closest('[data-stats-zone]');
  if (marked) return marked.getAttribute('data-stats-zone');
  if (link.closest('footer')) return 'footer';
  if (link.closest('nav, header')) return 'navbar';
  return 'page';
};

const onClick = (event) => {
  if (!state.view || (event.type === 'auxclick' && event.button !== 1)) return;
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link) return;
  const href = link.getAttribute('href') || '';
  let kind;
  let target;
  if (/^(tel|mailto):/i.test(href)) {
    kind = 'contact';
    target = href;
  } else {
    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.origin !== window.location.origin) {
      kind = 'outbound';
    } else if (/\.(pdf|docx?|xlsx?|pptx?|zip|jpe?g|png|webp)$/i.test(url.pathname)) {
      kind = 'download';
    } else {
      return; // a page of this site: counted as a page view
    }
    // Never the query string or fragment: they can carry personal details
    target = url.origin === window.location.origin ? url.pathname : `${url.origin}${url.pathname}`;
  }
  const label = (link.getAttribute('aria-label') || link.textContent || '').replace(/\s+/g, ' ').trim();
  send('hit', { kind, path: window.location.pathname, target, label: label.slice(0, 100), zone: zoneOf(link) });
};

const listen = () => {
  if (state.listening) return;
  state.listening = true;
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach((type) =>
    window.addEventListener(type, onInput, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', flush);
  document.addEventListener('click', onClick, { capture: true });
  document.addEventListener('auxclick', onClick, { capture: true });
};

// --- Page views ---------------------------------------------------------------------------

/** The 404 page calls this while rendering, so the page view is marked as "not found". */
export const markNotFound = () => {
  state.notFound = true;
};

/** Call after each route change has rendered. */
export const trackPageView = (pathname) => {
  if (!enabled()) return;
  if (/^\/(admin|login|test)(\/|$)/.test(pathname)) {
    flush();
    state.view = null;
    state.notFound = false;
    return;
  }
  listen();
  flush();

  const id = randomId();
  const data = {
    kind: 'pageview',
    id,
    path: pathname,
    width: window.innerWidth,
    height: window.innerHeight,
    notFound: state.notFound,
  };
  if (state.firstView) {
    // Where the visitor came from: only known for the first page of a page load
    data.referrer = document.referrer || undefined;
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      UTM_KEYS.map((key) => [key, params.get(`utm_${key}`)]).filter(([, value]) => value));
    if (params.get('ref') && !utm.source) utm.source = params.get('ref');
    if (Object.keys(utm).length) data.utm = utm;
    state.firstView = false;
  }
  state.notFound = false;
  state.view = {
    id,
    visibleSince: visible() ? Date.now() : null,
    startedAt: Date.now(),
    activeMs: 0,
    lastInput: Date.now(),
    interacted: false,
  };
  send('hit', data);
};
