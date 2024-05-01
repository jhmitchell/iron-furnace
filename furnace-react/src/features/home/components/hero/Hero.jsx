import React, { useState } from "react";
import HeroImage from "./heroImage/HeroImage";
import { useHours } from "/src/features/hours";
import "./Hero.css";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isOpen, message, loading } = useHours();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="hero">
      <HeroImage onImageLoad={handleImageLoad} />
      {imageLoaded && (
        <>
          <div className="hero-text">
            <h1>CORNWALL IRON FURNACE</h1>
            <h2>EXPLORING AMERICA'S RICH INDUSTRIAL HERITAGE</h2>
          </div>
          <div className="hours-container">
            {loading ? (
              <div className="loading">Loading hours...</div>
            ) : (
              <div className="hours-text">
                <span className={isOpen ? "status open" : "status closed"}>
                  {isOpen ? "OPEN" : "CLOSED"}
                </span>
                <span className="separator">|</span>
                {message}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;
