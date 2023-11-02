import React from "react";
import heroImage from "../../../../../assets/images/entrance.webp";
import "./HeroImage.css";

const HeroImage = ({ onImageLoad }) => {
  // Define a filter to decrease the contrast of the image, making it blend
  // in more seamlessly with the page content, increasing readability
  const filter = "contrast(0.90)";

  const handleImageLoad = () => {
    onImageLoad && onImageLoad();
  }

  return (
    <div className="hero-image">
      <div className="overlay" />
      <img src={heroImage} alt="Hero" style={{ filter: filter }} onLoad={handleImageLoad}/>
    </div>
  );
};

export default HeroImage;
