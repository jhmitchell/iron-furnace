const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;

export const getAllBoardMembers = async () => {
	try {
		const response = await fetch(`${API_V1_PREFIX}/board-members`);
		if (!response.ok) {
			throw new Error(`Error getting board members: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const createBoardMember = async (data) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/board-members`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Error creating board member: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const editBoardMember = async (id, data) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/board-members/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Error editing board member: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deleteBoardMember = async (id) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/board-members/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});
		if (!response.ok) {
			throw new Error(`Error deleting board member: ${response.status}`);
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const reorderBoardMembers = async (orderedIds) => {
	try {
		const storedUser = localStorage.getItem('user');
		const token = storedUser ? JSON.parse(storedUser).accessToken : null;
		if (!token) {
			throw new Error('Not authenticated');
		}
		const response = await fetch(`${API_V1_PREFIX}/board-members/reorder`, {
			method: 'PUT',
			body: JSON.stringify({ ordered_ids: orderedIds }),
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`Error reordering board members: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error(error);
		throw error;
	}
};
