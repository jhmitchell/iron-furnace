/**
 * Custom hook to manage the fetching and state of service hours.
 * It utilizes the getHours function from the hoursService to retrieve the data.
 * The hook returns the status of the hours (open or closed), a message, and a loading state.
 *
 * @returns {Object} Contains the status of the service hours (open or closed), a message, and a loading state.
 */

import { useState, useEffect } from 'react';
import { getHours } from '/src/features/hours';

export const useHours = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const { isOpen, message } = await getHours();
        setIsOpen(isOpen);
        setMessage(message);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  return { isOpen, message, loading };
};
