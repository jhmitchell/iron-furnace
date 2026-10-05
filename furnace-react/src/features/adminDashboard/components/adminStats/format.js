/* Formatting helpers for the Stats page. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-04" -> Date at local midnight (no time-zone shift) */
export const parseDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const shortDate = (iso) => {
  const date = parseDay(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
};

export const bucketLabel = (iso, bucket) => (bucket === 'week' ? `Week of ${shortDate(iso)}` : shortDate(iso));

export const formatNumber = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('en-US'));
