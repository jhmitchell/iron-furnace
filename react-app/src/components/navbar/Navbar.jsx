import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
<<<<<<< HEAD
      <div className="nav-container">
        <div className="nav-title">
          <p>CORNWALL</p>
=======
      <div className="nav-flex">
        <div className="nav-logo">
          <p>CORNWALL LOGO</p>
>>>>>>> 3168aec96e6b783dd9410d23fc56b8ea0fb5bd36
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/">About</Link>
        </div>
<<<<<<< HEAD
        <div className="nav-profile">
        </div>
=======
>>>>>>> 3168aec96e6b783dd9410d23fc56b8ea0fb5bd36
      </div>
    </nav>
  );
}

export default Navbar;
