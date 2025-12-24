import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { EventCard, getUpcomingEvents } from "/src/features/events";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from "./EventsSection.module.css";
import useWindowSize from '../../services/useWindowSize';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const windowSize = useWindowSize();
  
  const isMobile = (windowSize.width || window.innerWidth) <= 768;

  useEffect(() => {
    async function fetchEvents() {
      const events = await getUpcomingEvents(4);
      setEvents(events);
    }
    fetchEvents();
  }, []);

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

  const calculateImageHeight = () => {
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
    <section className={styles.eventsSection}>
      <div className={styles.contentContainer}>
        <h2 className={styles.sectionTitle}>Upcoming Programs and Events</h2>
        <Link to="events" className={styles.seeMore}>
          View our full schedule {">"}
        </Link>
        <div className={styles.eventsContainer}>
          <button 
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={scrollPrev} 
            aria-label="Previous slide"
          >
            <HiChevronLeft />
          </button>
          
          <div className={styles.emblaViewport} ref={emblaRef}>
            <div className={styles.emblaContainer}>
              {events.map((event, index) => (
                <div 
                  className={styles.emblaSlide} 
                  key={index}
                  style={{ flex: `0 0 ${getSlideWidth()}` }}
                >
                  <EventCard event={event} imageHeight={calculateImageHeight()} />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={scrollNext} 
            aria-label="Next slide"
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
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
