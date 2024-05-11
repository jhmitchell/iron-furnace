import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TextLink.module.css';

const TextLink = ({ to, children, target, rel, color }) => {
  // Check if the 'to' prop is an external link
  const isExternal = to.startsWith('http://') || to.startsWith('https://');

  const linkStyle = {
    color: color,
  };

  if (isExternal) {
    return (
      <a
        href={to}
        className={styles.textLink}
        style={color ? linkStyle : {}}
        target={target}
        rel={rel || 'noopener noreferrer'}
      >
        {children}
      </a>
    );
  } else {
    return (
      <Link to={to} className={styles.textLink} style={color ? linkStyle : {}}>
        {children}
      </Link>
    );
  }
};

export default TextLink;
