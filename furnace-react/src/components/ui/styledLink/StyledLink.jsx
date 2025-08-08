import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StyledLink.module.css';

const StyledLink = ({ to, children, target, rel }) => {
  const isExternal = typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://'));

  if (isExternal) {
    return (
      <a href={to} className={styles.styledLink} target={target || '_blank'} rel={rel || 'noopener noreferrer'}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={styles.styledLink}>
      {children}
    </Link>
  );
};

export default StyledLink;
