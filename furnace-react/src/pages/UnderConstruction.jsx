import React from 'react';
import { ArrowTextLink, TextLink } from '../components/ui';
import { FaTools } from 'react-icons/fa';
import styles from './UnderConstruction.module.css';

const UnderConstruction = () => {
  return (
    <div className={styles.underConstructionPage}>
      <div className={styles.contentWrapper}>
        <FaTools className={styles.icon} aria-hidden="true" />
        <h1 className={styles.heading}>Under Construction</h1>
        <h2 className={styles.subheading}>This page is currently being built.</h2>
        <p className={styles.paragraph}>
          We're working hard to bring you an amazing experience. Please check back soon!{' '}
          <TextLink to="/new-website-announcement">
            Read about our new website and upcoming features
          </TextLink>
          .
        </p>
        <div className={styles.buttonWrapper}>
          <ArrowTextLink text="Go Back to Home" path="/" fontSize="1.2" color="var(--text-off-white)" />
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;