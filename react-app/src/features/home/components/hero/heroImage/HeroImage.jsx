import React from "react";
//import heroImage from '../../../../../assets/images/hero_demo_2.png';
import heroImage from "../../../../../assets/images/entrance.jpg";
import "./HeroImage.css";

const HeroImage = () => {
  // Define a subtle gradient overlay to darken the edges of the image
  const gradient =
    "linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.2) 32%, rgba(0, 0, 0, 0.2) 68%, rgba(0,0,0,0.3) 70%, rgba(0, 0, 0, 0.7) 100%)";

  // Define a filter to decrease the contrast of the image, making it blend
  // in more seamlessly with the page content, increasing readability
  const filter = "contrast(0.90)";

  // Inline the relevant styles
  const heroImageStyle = {
    background: `${gradient}, url(${heroImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: filter,
  };

  return <div className="hero-image" style={heroImageStyle} />;
};

export default HeroImage;
