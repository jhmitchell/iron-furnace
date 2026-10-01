/**
 * Custom hook that fetches the home page announcement banner.
 * Mirrors useHours: a failed fetch is retried a few times so a flaky
 * first request (common with the dev proxy) does not hide the banner.
 *
 * @returns {Object} { banner, loading, error } where banner is null when none is set.
 */

import { useState, useEffect } from 'react';
import { getBanner } from '../services/bannerService';

const MAX_RETRIES = 3;
const RETRY_DELAY = 250;

export const useBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let retryCount = 0;

    const fetchBanner = async () => {
      try {
        const data = await getBanner();
        if (!active) return;
        setBanner(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        console.error('Error fetching banner:', err);
        setError(err);

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(fetchBanner, RETRY_DELAY);
        } else {
          setLoading(false);
        }
      }
    };

    fetchBanner();

    return () => {
      active = false;
    };
  }, []);

  return { banner, loading, error };
};
