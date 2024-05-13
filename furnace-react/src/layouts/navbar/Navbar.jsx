import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MembershipActions from './membershipActions/MembershipActions';
import TempLogo from "/src/assets/images/temp-logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // Toggle the hamburger menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? "unset" : "hidden";
  };

  // Add resize listener when the menu is open
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    if (menuOpen) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  // Close the hamburger menu when the window is resized above 769px
  useEffect(() => {
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
            <img src={TempLogo} alt="Cornwall Iron Furnace" />
          </Link>
        </div>
        <button className="menu-button" onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links ${menuOpen && "active"}`} style={{ height: menuOpen ? `${windowHeight - 70}px` : 'auto' }}>
          <Link to="/visit" className="nav-link" >VISIT</Link>
          <Link to="/about" className="nav-link" >ABOUT</Link>
          <Link to="/events" className="nav-link" >EVENTS</Link>
          <Link to="/support" className="nav-link" >SUPPORT</Link>
          <Link to="/shop" className="nav-link" >SHOP</Link>
          {menuOpen && (
            <button className="close-button" onClick={toggleMenu}>
              ✕
            </button>
          )}
        </div>
        <MembershipActions />
      </div>
    </nav>
  );
};

export default Navbar;
