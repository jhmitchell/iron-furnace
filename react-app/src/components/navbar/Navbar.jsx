import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-flex">
        <div className="nav-logo">
          <p>CORNWALL LOGO</p>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/">About</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
