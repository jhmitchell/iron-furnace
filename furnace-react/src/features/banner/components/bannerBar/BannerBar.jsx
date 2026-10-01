import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { TextLink } from '/src/components/ui';
import styles from './BannerBar.module.css';

/**
 * Presentational orange announcement bar. Rendered on the home page hero
 * and reused as the live preview in the admin dashboard.
 *
 * @param {string} message - Notice text
 * @param {string} [linkText] - Optional link label shown after the message
 * @param {string} [linkUrl] - Internal path ("/events") or external URL
 * @param {string} [className] - Extra classes for positioning
 */
const BannerBar = ({ message, linkText, linkUrl, className = '' }) => {
  const hasLink = Boolean(linkText && linkUrl);
  const isExternal = hasLink && /^https?:\/\//i.test(linkUrl);

  return (
    <div className={`${styles.bar} ${className}`.trim()} role="region" aria-label="Announcement">
      <div className={styles.inner}>
        <FaExclamationTriangle className={styles.icon} aria-hidden="true" />
        <p className={styles.text}>
          <span className={styles.message}>{message}</span>
          {hasLink && ' '}
          {hasLink && (
            <span className={styles.link}>
              <TextLink
                to={linkUrl}
                color="#26272c"
                underline={true}
                target={isExternal ? '_blank' : undefined}
              >
                {linkText}
              </TextLink>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default BannerBar;
