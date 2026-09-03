import React from 'react';
import { useBanner } from '../../hooks/useBanner';
import BannerBar from '../bannerBar/BannerBar';
import styles from './AnnouncementBanner.module.css';

/**
 * Admin-managed announcement banner pinned to the top of the home page hero.
 * Renders nothing when no banner has been published.
 */
const AnnouncementBanner = () => {
  const { banner } = useBanner();

  if (!banner) return null;

  return (
    <BannerBar
      message={banner.message}
      linkText={banner.link_text}
      linkUrl={banner.link_url}
      className={styles.heroBanner}
    />
  );
};

export default AnnouncementBanner;
