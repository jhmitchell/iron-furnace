/*
  Date helpers shared by the admin dashboard pages.
*/

// Parse "YYYY-MM-DD" as a local date (avoids the UTC shift of new Date("YYYY-MM-DD"))
export const parseLocalDate = (value) => new Date(`${String(value).slice(0, 10)}T00:00:00`);

export const formatHolidayDate = (value) =>
	parseLocalDate(value).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});

// The events list endpoint returns `start_date`; older callers used `event_start`.
export const eventStart = (event) => event.start_date || event.event_start;

export const formatEventDateTime = (iso) => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return 'Date TBD';
	return date.toLocaleString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
};
