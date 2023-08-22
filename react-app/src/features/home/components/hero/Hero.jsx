import React from "react";
import HeroImage from "./heroImage/HeroImage";
import "./Hero.css";

const Hero = () => {
  return (
    <div className="hero">
      <HeroImage />
      <div className="hero-text">
        <h1>CORNWALL</h1>
        <h2>EXPLORING AMERICA'S RICH INDUSTRIAL HERITAGE</h2>
      </div>
    </div>
  );
};

export default Hero;
