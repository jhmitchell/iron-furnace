import React, { useState } from "react";
import heroImage from "../../../../../assets/images/entrance.webp";
import styles from "./HeroImage.module.css";

const HeroImage = ({ onImageLoad }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onImageLoad?.();
  };

  return (
    <div className={styles.heroImage}>
      {/* Skeleton placeholder */}
      <div className={`${styles.skeleton} ${isLoaded ? styles.hidden : ""}`} />
      
      {/* Gradient overlay */}
      <div className={styles.overlay} />
      
      {/* Hero image with fade-in */}
      <img
        src={heroImage}
        alt="Cornwall Iron Furnace entrance"
        className={`${styles.image} ${isLoaded ? styles.loaded : ""}`}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default HeroImage;
