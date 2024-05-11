import React, { useState } from "react";
import HeroImage from "./heroImage/HeroImage";
import { useHours } from "/src/features/hours";
import ConstructionMessageBanner from "../constructionMessageBanner/ConstructionMessageBanner";
import styles from "./Hero.module.css";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isOpen, message, loading } = useHours();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={styles.hero}>
      <ConstructionMessageBanner />

      <HeroImage onImageLoad={handleImageLoad} />

      {imageLoaded && (
        <>
          <div className={styles.heroText}>
            <h1>CORNWALL IRON FURNACE</h1>
            <h2>EXPLORING AMERICA'S RICH INDUSTRIAL HERITAGE</h2>
          </div>
          <div className={styles.hoursContainer}>
            {loading ? (
              <div className={styles.loading}>Loading hours...</div>
            ) : (
              <div className={styles.hoursText}>
                <span className={isOpen ? styles.statusOpen : styles.statusClosed}>
                  {isOpen ? "OPEN" : "CLOSED"}
                </span>
                <span className={styles.separator}>|</span>
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
