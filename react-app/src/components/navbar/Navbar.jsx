import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navTitle">
        <p>CORNWALL</p>
      </div>
      <div className="navLinks">
        <Link to="/">Home</Link>
        <Link to="/">About</Link>
      </div>
    </nav>
  );
}

export default Navbar;
