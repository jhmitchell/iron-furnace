import { useState } from 'react';
import { setHours } from '../services/hoursService';

export const useSetHours = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSetHours = async (day, start_time, end_time) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await setHours(day, start_time, end_time);
      setMessage(response.message);
      setLoading(false);
    } catch (error) {
      console.error('Error in handleSetHours:', error);
      setMessage(error.message || 'Failed to set hours');
      setLoading(false);
    }
  };

  return { handleSetHours, loading, message };
};
