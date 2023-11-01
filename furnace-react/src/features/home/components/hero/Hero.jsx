import React from "react";
import HeroImage from "./heroImage/HeroImage";
import { useHours } from "/src/features/hours";
import "./Hero.css";

const Hero = () => {
  const { isOpen, message, loading } = useHours();

  return (
    <div className="hero">
      <HeroImage />
      <div className="hero-text">
        <h1>CORNWALL IRON FURNACE</h1>
        <h2>EXPLORING AMERICA'S RICH INDUSTRIAL HERITAGE</h2>
      </div>
      <div className="hours-container">
        {!loading && (
          <div className="hours-text">
            {/* Use isOpen to determine whether to display "OPEN" or "CLOSED" */}
            <span className={isOpen ? "status open" : "status closed"}>
              {isOpen ? "OPEN" : "CLOSED"}
            </span>
            <span className="separator">|</span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
