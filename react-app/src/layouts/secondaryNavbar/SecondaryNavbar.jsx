import React from "react";
import "./SecondaryNavbar.css";

const SecondaryNavbar = ({ children }) => {
  return (
    <nav className="secondary-navbar">
      <div className="secondary-nav-container">{children}</div>
    </nav>
  );
};

export default SecondaryNavbar;
