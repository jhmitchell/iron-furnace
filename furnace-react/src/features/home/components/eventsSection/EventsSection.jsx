import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { EventCard, getUpcomingEvents } from "/src/features/events";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import styles from "./EventsSection.module.css";
import useWindowSize from './useWindowSize';

const EventsSection = () => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const [events, setEvents] = useState([]);
  const windowSize = useWindowSize();

  useEffect(() => {
    async function fetchEvents() {
      const events = await getUpcomingEvents(4);
      setEvents(events);
    }
    fetchEvents();
  }, []);

  const calculateImageHeight = () => {
    const fullScreenHeight = 400;
    const minHeight = 200;
    const screenWidth = windowSize.width || window.innerWidth;
    const calculatedHeight = (screenWidth / 1920) * fullScreenHeight;
    return Math.max(calculatedHeight, minHeight);
  };

  const CustomLeftArrow = ({ onClick }) => (
    <button className={styles.customLeftArrow} onClick={onClick} style={{ top: `${calculateImageHeight() / 2}px` }}>
      <FaChevronLeft size={50} color="orange" />
    </button>
  );

  const CustomRightArrow = ({ onClick }) => (
    <button className={styles.customRightArrow} onClick={onClick} style={{ top: `${calculateImageHeight() / 2}px` }}>
      <FaChevronRight size={50} color="orange" />
    </button>
  );

  return (
    <section className={styles.eventsSection}>
      <div className={styles.contentContainer}>
        <h2 className={styles.sectionTitle}>Upcoming Programs and Events</h2>
        <Link to="events" className={styles.seeMore}>
          View our full schedule {">"}
        </Link>
        <div className={styles.eventsContainer}>
          <Carousel
            responsive={responsive}
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
            additionalTransfrom={0}
            arrows
            autoPlay
            autoPlaySpeed={5000}
            centerMode={false}
            className={styles.eventCarousel}
            containerClass={styles.eventCarouselContainer}
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite
            itemClass={styles.eventContainerItem}
            keyBoardControl
            minimumTouchDrag={80}
            pauseOnHover
            renderArrowsWhenDisabled={false}
            renderButtonGroupOutside={false}
            renderDotsOutside={true}
            rewind={false}
            rewindWithAnimation={false}
            rtl={false}
            shouldResetAutoplay
            showDots={false}
            sliderClass=""
            slidesToSlide={1}
            swipeable
          >
            {events.map((event, index) => (
              <EventCard key={index} event={event} imageHeight={calculateImageHeight()} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;