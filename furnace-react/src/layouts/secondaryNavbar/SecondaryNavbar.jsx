import React, { forwardRef } from "react";
import "./SecondaryNavbar.css";

const SecondaryNavbar = forwardRef((props, ref) => {
  const { children, className } = props;
  return (
    <nav ref={ref} className={`secondary-navbar ${className}`}>
      <div className="secondary-nav-container">{children}</div>
    </nav>
  );
});

export default SecondaryNavbar;
