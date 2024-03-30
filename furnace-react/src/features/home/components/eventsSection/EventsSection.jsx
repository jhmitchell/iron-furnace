import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { EventCard, getUpcomingEvents } from "/src/features/events";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./EventsSection.css";

const EventsSection = () => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
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

  const CustomLeftArrow = ({ onClick }) => (
    <button className="custom-left-arrow" onClick={onClick}>
      <FaChevronLeft size={50} color="orange" />
    </button>
  );

  const CustomRightArrow = ({ onClick }) => (
    <button className="custom-right-arrow" onClick={onClick}>
      <FaChevronRight size={50} color="orange" />
    </button>
  );

  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const events = await getUpcomingEvents(4);
      setEvents(events);
    }
    fetchEvents();
  }, []);

  return (
    <section className="events-section">
      <div className="content-container">
        <h2 className="section-title">Upcoming Events</h2>
        <div className="events-container">
          <Carousel
            responsive={responsive}
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
            additionalTransfrom={0}
            arrows
            autoPlay
            autoPlaySpeed={5000}
            centerMode={false}
            className="event-carousel"
            containerClass="event-carousel-container"
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite
            itemClass="event-container-item"
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
            {/*
            <EventCard
              image="/src/assets/images/events/jim2023.jpg"
              title="Industrial Innovation Conference"
              date="September 10, 2023"
              path="#"
            />
            <EventCard
              image="/src/assets/images/events/patrick2023.jpg"
              title="Cornwall Heritage Festival"
              date="October 5, 2023"
              path="#"
            />
            <EventCard
              image="/src/assets/images/events/mike2023.jpg"
              title="Sustainable Engineering Workshop"
              date="November 18, 2023"
              path="#"
            />
            */}

            {events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}

          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
