import React from 'react';
import { ArrowTextLink } from '../components/ui';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="text-flex">
        <h1>:-(</h1>
        <h2>We couldn't find the page you're looking for.</h2>
        <p>Want to go back?
          <ArrowTextLink text="TAKE ME HOME" path="/" fontSize="1.5"/>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
