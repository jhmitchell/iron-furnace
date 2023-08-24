import React from "react";
import HeroImage from "./heroImage/HeroImage";
import "./Hero.css";

const Hero = () => {
  const isOpen = true;

  return (
    <div className="hero">
      <HeroImage />
      <div className="hero-text">
        <h1>CORNWALL IRON FURNACE</h1>
        <h2>EXPLORING AMERICA'S RICH INDUSTRIAL HERITAGE</h2>
      </div>
      <div className="hours-container">
        <div className="blur" />
        <div className="hours-text">
          {/*Use isOpen to determine whether to display "OPEN" or "CLOSED"*/}
          <span className={isOpen ? "status open" : "status closed"}>
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
          <span className="separator">|</span>
          {/*Replace hours here*/}
          The museum is open today from 9:00 AM to 5:00 PM
        </div>
      </div>
    </div>
  );
};

export default Hero;
