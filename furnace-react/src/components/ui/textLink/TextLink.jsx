import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TextLink.module.css';

const TextLink = ({ to, children, target, rel, color = '#1a73e8', underline = false }) => {
  const isExternal = to.startsWith('http://') || to.startsWith('https://');

  const linkStyle = {
    color: color,
    textDecoration: underline ? 'underline' : 'none',
  };

  if (isExternal) {
    return (
      <a href={to} className={styles.textLink} target={target} rel={rel || 'noopener noreferrer'} style={linkStyle}>
        {children}
      </a>
    );
  } else {
    return (
      <Link to={to} className={styles.textLink} style={linkStyle}>
        {children}
      </Link>
    );
  }
};

export default TextLink;
