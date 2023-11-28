import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MembershipActions from './membershipActions/MembershipActions';
import "./Navbar.css";

const Navbar = () => {
  /*
   * menuOpen is used for the state of the hamburger menu
   */
  const [menuOpen, setMenuOpen] = React.useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  /*
   * When the navbar is rendered, do the following:
   * 1. Scroll to the top of the page
   * 2. Listen for window resize to handle the hamburger menu
   */
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleResize = () => {
      if (window.innerWidth > 769) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
        <button className="menu-button" onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links ${menuOpen && "active"}`}>
          <Link to="/visit" className="nav-link">VISIT</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/events" className="nav-link">EVENTS</Link>
          <Link to="/support" className="nav-link">SUPPORT</Link>
          <Link to="/shop" className="nav-link">SHOP</Link>
          {menuOpen && (
            <button className="close-button" onClick={toggleMenu}>
            ✕
            </button>
          )}
        </div>
        < MembershipActions />
      </div>
    </nav>
  );
};

export default Navbar;
