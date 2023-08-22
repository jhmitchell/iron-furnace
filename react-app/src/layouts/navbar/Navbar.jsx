import React, { useContext } from "react";
import { Link } from "react-router-dom";
import MembershipActions from './membershipActions/MembershipActions';
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">CORNWALL</Link>
        </div>
        <div className="nav-links">
          <Link to="/">VISIT</Link>
          <Link to="/">ABOUT</Link>
          <Link to="/">HISTORY</Link>
          <Link to="/">EVENTS</Link>
          <Link to="/">SUPPORT</Link>
        </div>
        < MembershipActions />
      </div>
    </nav>
  );
};

export default Navbar;
