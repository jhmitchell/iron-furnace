/*
  Functions that are used to make HTTP requests to the
  server for business hours related information.
*/

const API_V1_PREFIX = import.meta.env.VITE_API_V1_PREFIX;

export const getHours = async () => {
  try {
    const response = await fetch(`${API_V1_PREFIX}/hours/status`);
    if (!response.ok) {
      throw new Error(`Error getting hours: ${response.status}`);
    }

    const { status, message } = await response.json();
    return {
      isOpen: status === 'open',
      message
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
