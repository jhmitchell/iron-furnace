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
          <span className={isOpen ? "status open" : "status closed"}>
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
          <span className="separator">|</span>
          The museum is open today from 9:00 AM to 6:00 PM
        </div>
      </div>
    </div>
  );
};

export default Hero;
