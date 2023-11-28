import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MembershipActions from './membershipActions/MembershipActions';
import "./Navbar.css";

const Navbar = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo-container">
          <Link to="/" className="nav-logo">
            <div className="logo-image" />
            <div className="logo-text">
              <div className="logo-text-cornwall">CORNWALL</div>
              <div className="logo-text-ironfurnace">IRON FURNACE</div>
            </div>
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/visit" className="nav-link">VISIT</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/events" className="nav-link">EVENTS</Link>
          <Link to="/support" className="nav-link">SUPPORT</Link>
          <Link to="/shop" className="nav-link">SHOP</Link>
        </div>
        < MembershipActions />
      </div>
    </nav>
  );
};

export default Navbar;
