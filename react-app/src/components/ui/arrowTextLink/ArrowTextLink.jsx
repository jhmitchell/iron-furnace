import React from 'react';
import { Link } from 'react-router-dom';
import './ArrowTextLink.css';

const ArrowTextLink = ({ text, path }) => (
  <Link to={path} className="animated-arrow">
    <span className="the-arrow -left"><span className="shaft"></span></span>
    <span className="main">
      <span className="text">{text}</span>
      <span className="the-arrow -right"><span className="shaft"></span></span>
    </span>
  </Link>
);

export default ArrowTextLink;
