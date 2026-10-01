/**
 * The signed-in admin's session as stored in this browser.
 *
 * Shape: { username, accessToken } under localStorage "user". The admin services
 * (events, hours, sponsors, ...) read the access token from there, so the shape is kept.
 * The long-lived refresh token is NOT here: it is an HttpOnly cookie that scripts can't read.
 */
export const STORAGE_KEY = 'user';

export const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session.accessToken !== 'string' || !session.accessToken) return null;
    return session;
  } catch {
    return null;
  }
};

export const writeStoredSession = (session) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage full or blocked: the session still works in this tab
  }
};

export const clearStoredSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
};

/**
 * Reads the (unverified) claims of a JWT. Only used for scheduling refreshes and display;
 * the server verifies every token it receives.
 */
const readClaims = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Expiry time of a JWT in milliseconds since the epoch, or null if unknown. */
export const tokenExpiresAt = (token) => {
  const exp = readClaims(token)?.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
};

/** The account name (JWT "sub") a token was issued for, or null. */
export const tokenSubject = (token) => {
  const sub = readClaims(token)?.sub;
  return typeof sub === 'string' && sub ? sub : null;
};

/**
 * Only allow redirects to pages of this site. Accepts a react-router location object
 * (what ProtectedRoute puts in state.from) or a path string. Anything else, including
 * protocol-relative ("//evil.example") and backslash tricks, falls back to `fallback`.
 */
export const safeRedirectPath = (from, fallback = '/admin') => {
  let path;
  if (typeof from === 'string') {
    path = from;
  } else if (from && typeof from.pathname === 'string') {
    const search = typeof from.search === 'string' ? from.search : '';
    const hash = typeof from.hash === 'string' ? from.hash : '';
    path = `${from.pathname}${search}${hash}`;
  } else {
    return fallback;
  }

  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(path)) return fallback;
  if (path === '/login' || path.startsWith('/login?') || path.startsWith('/login#') || path.startsWith('/login/')) {
    return fallback;
  }
  return path;
};
