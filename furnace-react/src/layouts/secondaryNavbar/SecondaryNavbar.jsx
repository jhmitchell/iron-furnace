import React, { forwardRef } from 'react';
import styles from './SecondaryNavbar.module.css';

const SecondaryNavbar = forwardRef((props, ref) => {
  const { children, className } = props;
  return (
    <nav ref={ref} className={`${styles.secondaryNavbar} ${className}`}>
      <div className={styles.secondaryNavContainer}>{children}</div>
    </nav>
  );
});

export default SecondaryNavbar;
