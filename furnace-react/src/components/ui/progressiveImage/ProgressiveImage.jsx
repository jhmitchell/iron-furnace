import React, { useState, useRef, useEffect } from "react";
import styles from "./ProgressiveImage.module.css";

/**
 * ProgressiveImage - A performant image component with smooth fade-in loading
 * 
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Smooth fade-in animation when image loads
 * - Optional placeholder/skeleton state
 * - Prevents layout shift with aspect ratio support
 */
const ProgressiveImage = ({
  src,
  alt,
  className = "",
  style = {},
  aspectRatio,
  objectFit = "cover",
  onLoad,
  eager = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (eager) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [eager]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const containerStyle = {
    ...style,
    ...(aspectRatio && { aspectRatio }),
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={containerStyle}
    >
      {/* Skeleton placeholder */}
      <div className={`${styles.skeleton} ${isLoaded ? styles.hidden : ""}`} />

      {/* Actual image - only render when in view */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${styles.image} ${isLoaded ? styles.loaded : ""}`}
          style={{ objectFit }}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;

