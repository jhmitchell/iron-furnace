/*
  Requests for the admin Stats page (see backend/app/routers/stats.py).
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

const get = async (path, signal) => {
  const response = await fetch(`${API_V1_PREFIX}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Error loading stats: ${response.status}`);
  }
  return response.json();
};

/**
 * @param {'7d'|'30d'|'90d'|'12m'} range
 * @param {{key: string, value: string}|null} filter  e.g. { key: 'page', value: '/visit' }
 */
export const getStatsReport = (range, filter, signal) => {
  const params = new URLSearchParams({ range });
  if (filter) params.set('filter', `${filter.key}:${filter.value}`);
  return get(`/stats/report?${params}`, signal);
};

export const getStatsHealth = (signal) => get('/stats/health', signal);
