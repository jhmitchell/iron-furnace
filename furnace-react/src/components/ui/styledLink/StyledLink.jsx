import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StyledLink.module.css';

const StyledLink = ({ to, children }) => {
  return (
    <Link to={to} className={styles.styledLink}>
      {children}
    </Link>
  );
};

export default StyledLink;
