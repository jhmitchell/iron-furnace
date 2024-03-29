/*
	Functions that are used to make HTTP requests to the
	server for events related information.
*/

const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;

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
