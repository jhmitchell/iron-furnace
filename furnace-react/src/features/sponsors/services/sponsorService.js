const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;

export const getAllSponsors = async () => {
	try {
		const response = await fetch(`${API_V1_PREFIX}/sponsors`);
		if (!response.ok) {
			throw new Error(`Error getting sponsors: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const createSponsor = async (data) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/sponsors`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Error creating sponsor: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const editSponsor = async (id, data) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/sponsors/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Error editing sponsor: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteSponsor = async (id) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/sponsors/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});
		if (!response.ok) {
			throw new Error(`Error deleting sponsor: ${response.status}`);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const reorderSponsors = async (orderedIds) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/sponsors/reorder`, {
			method: 'PUT',
			body: JSON.stringify({ ordered_ids: orderedIds }),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Error reordering sponsors: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};
