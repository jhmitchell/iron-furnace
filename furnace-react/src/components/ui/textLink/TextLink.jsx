import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TextLink.module.css';

const TextLink = ({ to, children }) => {
  return (
    <Link to={to} className={styles.textLink}>
      {children}
    </Link>
  );
};

export default TextLink;
