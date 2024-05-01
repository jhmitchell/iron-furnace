/**
 * Custom hook to manage the fetching and state of service hours.
 * It utilizes the getHours function from the hoursService to retrieve the data.
 * The hook returns the status of the hours (open or closed), a message, and a loading state.
 *
 * @returns {Object} Contains the status of the service hours (open or closed), a message, and a loading state.
 */

import { useState, useEffect } from 'react';
import { getHours } from '/src/features/hours';

const MAX_RETRIES = 5;
const RETRY_DELAY = 250;

export const useHours = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let retryCount = 0;

    // Fetch hours data from the API
    // Retry fetching up to MAX_RETRIES times with a delay of RETRY_DELAY milliseconds
    // This fixes a permanent loading state if the initial fetch fails
    const fetchHours = async () => {
      try {
        const { isOpen, message } = await getHours();
        setIsOpen(isOpen);
        setMessage(message);
        setError(null);
      } catch (error) {
        console.error('Error fetching hours:', error);
        setError(error);

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(fetchHours, RETRY_DELAY);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  return { isOpen, message, loading, error };
};
