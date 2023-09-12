import React from 'react';
import { Link } from 'react-router-dom';
import './ArrowTextLink.css';

const ArrowTextLink = ({ text, path, fontSize="1.5" }) => {
  const styleVariables = {
    '--fontSize': `${fontSize}rem`,
    '--text-arrow-space': `${fontSize * 0.5}rem`,
    '--shaft-width': `${fontSize * 1.7}rem`,
    '--shaft-thickness': `${fontSize * 0.1}rem`,
    '--arrow-head-width': `${fontSize * 0.5}rem`,
    '--arrow-head-thickness': `${fontSize * 0.1}rem`
  };

  return (
    <Link to={path} className="animated-arrow" style={styleVariables}>
      <span className="the-arrow -left"><span className="shaft"></span></span>
      <span className="arrow-main">
        <span className="text">{text}</span>
        <span className="the-arrow -right"><span className="shaft"></span></span>
      </span>
    </Link>
  );
};

export default ArrowTextLink;
