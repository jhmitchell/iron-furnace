import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-title">
          <p>CORNWALL</p>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/">About</Link>
        </div>
        <div className="nav-profile">
          <Link to="/">Membership</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
