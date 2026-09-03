/*
  Functions used to make HTTP requests to the server for the
  home page announcement banner. Only one banner exists at a time.
*/

const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;

const getToken = () => {
  const storedUser = localStorage.getItem('user');
  const token = storedUser ? JSON.parse(storedUser).accessToken : null;
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
};

/**
 * Pulls a human-readable error out of a failed response. FastAPI returns
 * `{ detail: "..." }` for validation errors raised by the banner router.
 */
const errorFromResponse = async (response, fallback) => {
  try {
    const body = await response.json();
    if (typeof body?.detail === 'string') {
      return new Error(body.detail);
    }
  } catch {
    // Body was not JSON; fall through to the generic message.
  }
  return new Error(`${fallback}: ${response.status}`);
};

/**
 * Fetches the current banner.
 * @returns {Promise<Object|null>} The banner, or null when none is set.
 */
export const getBanner = async () => {
  try {
    const response = await fetch(`${API_V1_PREFIX}/banner`);
    if (!response.ok) {
      throw new Error(`Error getting banner: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Creates or replaces the banner.
 * @param {{ message: string, link_text?: string, link_url?: string }} data
 * @returns {Promise<Object>} The saved banner.
 */
export const setBanner = async ({ message, link_text, link_url }) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_V1_PREFIX}/banner`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        link_text: link_text || null,
        link_url: link_url || null,
      }),
    });
    if (!response.ok) {
      throw await errorFromResponse(response, 'Error saving banner');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Removes the banner from the home page.
 */
export const deleteBanner = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${API_V1_PREFIX}/banner`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw await errorFromResponse(response, 'Error removing banner');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
