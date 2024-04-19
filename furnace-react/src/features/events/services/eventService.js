const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;
const EVENT_IMAGE_DIR = `/static/event_images`;

export const getAllEvents = async () => {
	try {
		const response = await fetch(`${API_V1_PREFIX}/events`);
		if (!response.ok) {
			throw new Error(`Error getting events: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const getUpcomingEvents = async (numEvents) => {
	try {
		const response = await fetch(`${API_V1_PREFIX}/events/${numEvents}`);
		if (!response.ok) {
			throw new Error(`Error getting upcoming events: ${response.status}`);
		}

		const data = await response.json();

		// Construct the image URL for each event
		data.forEach(event => {
			if (event) {
				event.image = `${EVENT_IMAGE_DIR}/${event.id}`;
			}
		});

		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const createEvent = async (event, imageFile) => {
	console.log('event:', event);
	const formData = new FormData();

	Object.keys(event).forEach(key => {
		formData.append(key, event[key]);
	});

	formData.append('image', imageFile);

	console.log('formData:', formData);
	try {
		const response = await fetch(`${API_V1_PREFIX}/events`, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error(`Error creating event: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteEvent = async (eventId) => {
	try {
		const response = await fetch(`${API_V1_PREFIX}/events/${eventId}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error(`Error deleting event: ${response.status}`);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const editEvent = async (eventId, title, description, pdfFile, linkText) => {
	const formData = new FormData();
	formData.append('title', title);
	if (description) {
		formData.append('description', description);
	}
	if (pdfFile) {
		formData.append('pdf', pdfFile);
	}
	if (linkText) {
		formData.append('link_text', linkText);
	}
	console.log(title, description, pdfFile, linkText);
	try {
		const response = await fetch(`${API_V1_PREFIX}/events/${eventId}`, {
			method: 'PUT',
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Error editing event: ${response.statusText}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const groupEventsByYearAndMonth = (events) => {
	const yearMonthMap = new Map();

	events.forEach((event) => {
		const date = new Date(event.start_date);
		const year = date.getFullYear();
		const month = date.toLocaleString("default", { month: "long" });

		if (!yearMonthMap.has(year)) {
			yearMonthMap.set(year, new Map());
		}

		const monthMap = yearMonthMap.get(year);
		if (!monthMap.has(month)) {
			monthMap.set(month, []);
		}

		monthMap.get(month).push(event);
	});

	const sortedYearMonthMap = new Map(
		[...yearMonthMap.entries()].sort((a, b) => a[0] - b[0])
	);

	sortedYearMonthMap.forEach((monthMap, year) => {
		sortedYearMonthMap.set(
			year,
			new Map(
				[...monthMap.entries()].sort((a, b) => {
					const monthOrder = [
						"January",
						"February",
						"March",
						"April",
						"May",
						"June",
						"July",
						"August",
						"September",
						"October",
						"November",
						"December",
					];
					return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]);
				})
			)
		);
	});

	return sortedYearMonthMap;
};
