import React, { useCallback, useEffect, useState } from "react";
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from "./VideoSection.module.css";
import useWindowSize from '../../services/useWindowSize';

const VideoSection = () => {
  // List of Video IDs - will pull from backend
  const videoIds = ["8IJu6yMUQF4", "lmb7jrxW2oY", "0zuiKQ02ZdA", "Z3IH3X36ktE"];
  const youtubeChannelUrl = "https://www.youtube.com/@cornwallironfurnace6291";

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const windowSize = useWindowSize();
  
  const isMobile = (windowSize.width || window.innerWidth) <= 768;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: isMobile ? 'center' : 'start',
      slidesToScroll: 1,
      containScroll: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  // Track selected slide for pagination dots
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const calculateVideoHeight = () => {
    const fullScreenHeight = 400;
    const minHeight = 200;
    const screenWidth = windowSize.width || window.innerWidth;
    const calculatedHeight = (screenWidth / 1920) * fullScreenHeight;
    return Math.max(calculatedHeight, minHeight);
  };

  // Calculate slide width based on screen size
  const getSlideWidth = () => {
    const screenWidth = windowSize.width || window.innerWidth;
    if (screenWidth <= 480) return '92%';  // Mobile: subtle peek, main slide prominent
    if (screenWidth <= 768) return '48%';  // Tablet: 2 slides with peek
    return '50%';  // Desktop: 2 slides
  };

  return (
    <section className={styles.videoSection}>
      <div className={styles.contentContainer}>
        <h2 className={styles.sectionTitle}>Featured Videos</h2>
        <a href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className={styles.seeMore}>
          Visit our YouTube channel {">"}
        </a>
        <div className={styles.videoContainer}>
          <button 
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={scrollPrev} 
            aria-label="Previous video"
          >
            <HiChevronLeft />
          </button>
          
          <div className={styles.emblaViewport} ref={emblaRef}>
            <div className={styles.emblaContainer}>
              {videoIds.map((videoId, index) => (
                <div 
                  className={styles.emblaSlide} 
                  key={index}
                  style={{ flex: `0 0 ${getSlideWidth()}` }}
                >
                  <div className={styles.videoWrapper}>
                    <iframe
                      title={`Video ${index + 1}`}
                      src={`https://www.youtube.com/embed/${videoId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={scrollNext} 
            aria-label="Next video"
          >
            <HiChevronRight />
          </button>
        </div>

        {/* Pagination dots - visible on mobile */}
        {isMobile && scrollSnaps.length > 0 && (
          <div className={styles.pagination}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === selectedIndex ? styles.dotActive : ''}`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
