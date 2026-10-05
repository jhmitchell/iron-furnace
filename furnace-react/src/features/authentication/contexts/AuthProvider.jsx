import { createContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  AuthError,
  loginService,
  logoutService,
  refreshTokenService,
  validateTokenService,
} from "../services/authService";
import {
  STORAGE_KEY,
  readStoredSession,
  writeStoredSession,
  clearStoredSession,
  tokenExpiresAt,
  tokenSubject,
} from "../utils/session";
import { setIgnoreThisBrowser } from "/src/features/stats";

export const AuthContext = createContext();

// How often to check whether the access token needs refreshing while signed in.
const CHECK_INTERVAL_MS = 60 * 1000;
// Refresh when the access token (30 minutes) has less than this left.
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;
// For a token whose expiry can't be read: refresh this often.
const FALLBACK_REFRESH_INTERVAL_MS = 20 * 60 * 1000;
// Serializes refreshes across tabs (each refresh rotates the shared refresh cookie).
const REFRESH_LOCK_NAME = "cif-auth-refresh";

/** The server said this session is over (as opposed to a network or server hiccup). */
const isSessionOver = (error) =>
  error instanceof AuthError && (error.kind === "invalid" || error.kind === "disabled");

const needsRefresh = (session, lastRefreshAt) => {
  const expiresAt = tokenExpiresAt(session.accessToken);
  if (expiresAt) return expiresAt - Date.now() < REFRESH_BEFORE_EXPIRY_MS;
  return Date.now() - lastRefreshAt >= FALLBACK_REFRESH_INTERVAL_MS;
};

const withRefreshLock = (callback) =>
  typeof navigator !== "undefined" && navigator.locks?.request
    ? navigator.locks.request(REFRESH_LOCK_NAME, callback)
    : callback();

const AuthProvider = ({ children }) => {
  /**
   * - user: { username, accessToken } while signed in, otherwise null.
   * - loading: true until the stored session (if any) has been checked on page load.
   * - isProcessing: true while a sign-in request is in progress.
   */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshInFlight = useRef(null);
  const lastRefreshAt = useRef(Date.now());
  // Bumped on sign-out, so a refresh that finishes afterwards can't sign the user back in.
  const generation = useRef(0);

  const startSession = useCallback((accessToken, fallbackUsername) => {
    const session = { username: tokenSubject(accessToken) || fallbackUsername, accessToken };
    writeStoredSession(session);
    lastRefreshAt.current = Date.now();
    setUser(session);
    return session;
  }, []);

  const clearSession = useCallback(() => {
    generation.current += 1;
    clearStoredSession();
    setUser(null);
  }, []);

  /**
   * Exchanges the HttpOnly refresh cookie for a new access token. One refresh at a time
   * per tab, and across tabs via the Web Locks API: if another tab refreshed while this
   * one waited, its fresh token is used instead of rotating the cookie again.
   * Rejects with an AuthError.
   */
  const refreshSession = useCallback(({ force = false } = {}) => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const startedIn = generation.current;
    const run = withRefreshLock(async () => {
      const stored = readStoredSession();
      if (!force && stored && !needsRefresh(stored, lastRefreshAt.current)) {
        setUser((current) => (current?.accessToken === stored.accessToken ? current : stored));
        return stored;
      }
      const accessToken = await refreshTokenService();
      if (generation.current !== startedIn) {
        throw new AuthError("invalid"); // signed out meanwhile
      }
      return startSession(accessToken, stored?.username);
    });

    refreshInFlight.current = run.finally(() => {
      refreshInFlight.current = null;
    });
    return refreshInFlight.current;
  }, [startSession]);

  // On page load: check the stored access token with the server. If it has expired or
  // was rejected, try the refresh cookie. Only sign out when the server says the session
  // is over; on a network or server error keep the session and retry later.
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const stored = readStoredSession();
      if (!stored) {
        clearStoredSession(); // drop anything unreadable
        return;
      }

      const expiresAt = tokenExpiresAt(stored.accessToken);
      const stillValid = !expiresAt || expiresAt - Date.now() > 30 * 1000;
      if (stillValid) {
        try {
          await validateTokenService(stored.accessToken);
          if (!cancelled) setUser(stored);
          return;
        } catch (error) {
          if (cancelled) return;
          if (!isSessionOver(error)) {
            setUser(stored);
            return;
          }
          if (error.kind === "disabled") {
            clearSession();
            return;
          }
          // "invalid": fall through to a refresh
        }
      }

      try {
        await refreshSession({ force: true });
      } catch (error) {
        if (cancelled) return;
        if (isSessionOver(error)) clearSession();
        else setUser(stored);
      }
    };

    init().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [clearSession, refreshSession]);

  // While signed in: refresh shortly before the access token expires. Also check when the
  // tab becomes visible again or the connection comes back (timers are paused or slowed
  // while a laptop sleeps or a tab is in the background).
  const signedIn = Boolean(user);
  useEffect(() => {
    if (!signedIn) return undefined;

    const keepAlive = () => {
      const stored = readStoredSession();
      if (!stored || !needsRefresh(stored, lastRefreshAt.current)) return;
      refreshSession().catch((error) => {
        if (isSessionOver(error)) clearSession();
        // Network/server errors: try again on the next check
      });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") keepAlive();
    };

    const intervalId = setInterval(keepAlive, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", keepAlive);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", keepAlive);
    };
  }, [signedIn, refreshSession, clearSession]);

  // Keep tabs in sync: signing in, refreshing or signing out in one tab updates the others.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const stored = readStoredSession();
      if (!stored) generation.current += 1;
      setUser((current) => {
        if (!stored) return null;
        return current?.accessToken === stored.accessToken ? current : stored;
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /**
   * Signs in. Resolves to { ok: true } or { ok: false, error, retryAfter }, where error is
   * an AuthError kind ("invalid", "disabled", "rate_limited", "server", "network").
   * Never rejects and never logs credentials.
   */
  const login = useCallback(async ({ username, password }) => {
    setIsProcessing(true);
    try {
      const { access_token } = await loginService(username, password);
      startSession(access_token, username);
      // Staff browsing the site shouldn't count as visitors (can be undone on the Stats page)
      setIgnoreThisBrowser(true);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof AuthError ? error.kind : "server",
        retryAfter: error instanceof AuthError ? error.retryAfter : null,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [startSession]);

  /** Signs out here and revokes the refresh token on the server. */
  const logout = useCallback(() => {
    const revoked = logoutService(); // sends the refresh cookie before local state is cleared
    clearSession();
    return revoked;
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, isProcessing, login, logout }),
    [user, loading, isProcessing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
