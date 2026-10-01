const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;
const AUTH_PREFIX = import.meta.env.VITE_AUTH_PREFIX;

// Must match the backend's message for a disabled account (authentication.py)
const DISABLED_ACCOUNT_DETAIL = 'This account has been disabled';

/**
 * Why an auth request failed. `kind` is one of:
 * - "invalid":      wrong username or password (or a rejected/expired token)
 * - "disabled":     the account has been disabled
 * - "rate_limited": too many failed attempts; `retryAfter` is in seconds (or null)
 * - "server":       the server answered with an unexpected error
 * - "network":      the server could not be reached
 *
 * Messages never contain credentials or tokens.
 */
export class AuthError extends Error {
  constructor(kind, { status = null, retryAfter = null } = {}) {
    super(`Authentication failed: ${kind}${status ? ` (${status})` : ''}`);
    this.name = 'AuthError';
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const request = async (url, options) => {
  try {
    // Same-origin requests send the HttpOnly refresh cookie automatically
    return await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
  } catch {
    throw new AuthError('network');
  }
};

const readDetail = async (response) => {
  try {
    const body = await response.json();
    return typeof body?.detail === 'string' ? body.detail : null;
  } catch {
    return null;
  }
};

const errorFor = async (response) => {
  const { status } = response;
  if (status === 401 || status === 403 || status === 422) {
    const detail = await readDetail(response);
    return new AuthError(detail === DISABLED_ACCOUNT_DETAIL ? 'disabled' : 'invalid', { status });
  }
  if (status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After'), 10);
    return new AuthError('rate_limited', { status, retryAfter: Number.isFinite(retryAfter) ? retryAfter : null });
  }
  return new AuthError('server', { status });
};

const readAccessToken = async (response) => {
  let body;
  try {
    body = await response.json();
  } catch {
    throw new AuthError('server', { status: response.status });
  }
  if (!body || typeof body.access_token !== 'string' || !body.access_token) {
    throw new AuthError('server', { status: response.status });
  }
  return body.access_token;
};

/**
 * Signs in with a username and password.
 * The access token is returned; the refresh token is set by the server as an HttpOnly cookie.
 * @returns {Promise<{access_token: string, token_type: string}>}
 * @throws {AuthError}
 */
export const loginService = async (username, password) => {
  const response = await request(`${API_V1_PREFIX}${AUTH_PREFIX}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) {
    throw await errorFor(response);
  }

  return { access_token: await readAccessToken(response), token_type: 'bearer' };
};

/**
 * Ends the server-side session: revokes the refresh token and clears its cookie.
 * Never throws, since the client clears its own state regardless.
 */
export const logoutService = async () => {
  try {
    await request(`${API_V1_PREFIX}${AUTH_PREFIX}/logout`, { method: 'POST' });
  } catch {
    // Nothing more to do: the refresh token expires on its own
  }
};

/**
 * Exchanges the HttpOnly refresh cookie for a new access token (and a rotated cookie).
 * @returns {Promise<string>} The new access token.
 * @throws {AuthError} kind "invalid"/"disabled" when the session is over for good,
 *   "network"/"server" when it might work again later.
 */
export const refreshTokenService = async () => {
  const response = await request(`${API_V1_PREFIX}${AUTH_PREFIX}/token/refresh`, { method: 'POST' });
  if (!response.ok) {
    throw await errorFor(response);
  }
  return readAccessToken(response);
};

/**
 * Checks an access token with the server.
 * @returns {Promise<object>} The signed-in user's public profile (member_id, names, email).
 * @throws {AuthError}
 */
export const validateTokenService = async (accessToken) => {
  if (!accessToken) {
    throw new AuthError('invalid');
  }

  const response = await request(`${API_V1_PREFIX}/users/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw await errorFor(response);
  }

  let profile;
  try {
    profile = await response.json();
  } catch {
    throw new AuthError('server', { status: response.status });
  }
  if (!profile || !profile.member_id) {
    throw new AuthError('server', { status: response.status });
  }
  return profile;
};
