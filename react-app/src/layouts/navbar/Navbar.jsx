import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/authentication";
import "./Navbar.css";

const Navbar = () => {
  // Retrieve the user object from the AuthContext
  const { user } = useAuth();

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
        <div className="nav-profile">
          {user ? (
            <Link to="/profile">{user.username}</Link>
          ) : (
            <Link to="/login">MEMBERSHIP | DONATE</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
