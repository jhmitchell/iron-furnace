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
      isOpen: status === 'OPEN',
      message
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllHours = async () => {
  try {
    const response = await fetch(`${API_V1_PREFIX}/hours`);
    if (!response.ok) {
      throw new Error(`Error getting hours: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const setHours = async (day, start_time, end_time) => {
  // Append ':00' for seconds if times are provided
  const formattedStartTime = start_time ? `${start_time}:00` : null;
  const formattedEndTime = end_time ? `${end_time}:00` : null;

  try {
    const response = await fetch(`${API_V1_PREFIX}/hours/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ day, start_time: formattedStartTime, end_time: formattedEndTime })
    });

    if (!response.ok) {
      throw new Error(`Error setting hours: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getHolidays = async () => {
  try {
    const response = await fetch(`${API_V1_PREFIX}/holidays`);
    if (!response.ok) {
      throw new Error(`Error getting holidays: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const setHoliday = async (date, description) => {
  try {
    const response = await fetch(`${API_V1_PREFIX}/holidays/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error setting holiday: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
