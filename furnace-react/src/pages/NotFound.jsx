import React from 'react';
import { ArrowTextLink } from '../components/ui';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.textFlex}>
        <h1 className={styles.heading}>Error 404</h1>
        <h2 className={styles.subheading}>We couldn't find the page you're looking for.</h2>
        <p className={styles.paragraph}>
          Want to go back? <ArrowTextLink text="TAKE ME HOME" path="/" fontSize="1.5" />
        </p>
      </div>
    </div>
  );
};

export default NotFound;