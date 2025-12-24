import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./MediaCard.module.css";

const MediaCard = ({ image, imageHeight, title, subtitle, description, linkText, path, clickable, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  const CardContainer = clickable ? Link : 'div';
  const cardProps = clickable ? { to: path } : {};

  // Lazy load with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <CardContainer {...cardProps} className={styles.mediaCard} ref={containerRef}>
      <div className={styles.imageContainer} style={{ height: imageHeight }}>
        {/* Skeleton placeholder */}
        <div className={`${styles.skeleton} ${isLoaded ? styles.hidden : ""}`} />
        
        {/* Actual image - only render when in view */}
        {isInView && (
          <img
            src={image}
            alt={title}
            className={`${styles.mediaImage} ${isLoaded ? styles.loaded : ""}`}
            onLoad={handleLoad}
          />
        )}
      </div>
      <div className={styles.mediaDetails}>
        <h3 className={styles.mediaTitle}>{title}</h3>
        <p className={styles.mediaSubtitle}>{subtitle}</p>
        {description && <p className={styles.mediaDescription}>{description}</p>}
        {children}
        {linkText && <p className={styles.linkText}>{linkText}</p>}
      </div>
    </CardContainer>
  );
};

export default MediaCard;
