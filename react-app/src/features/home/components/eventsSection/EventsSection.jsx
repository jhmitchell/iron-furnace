import React from "react";
import EventCard from "./eventsCard/EventsCard";
import "./EventsSection.css";

const EventsSection = () => {
  return (
    <section className="events-section">
      <div className="events-flex">
        <EventCard
          image="/src/assets/images/big_wheel.jpg"
          title="Industrial Innovation Conference"
          date="September 10, 2023"
          description="Join us for a day of insights into the world of industrial innovation."
          path="#"
        />
        <EventCard
          image="/src/assets/images/entrance.jpg"
          title="Cornwall Heritage Festival"
          date="October 5, 2023"
          description="Celebrate the rich heritage of Cornwall with food, music, and art."
          path="#"
        />
        <EventCard
          image="/src/assets/images/hero_demo.png"
          title="Sustainable Engineering Workshop"
          date="November 18, 2023"
          description="A hands-on workshop focused on sustainable practices in modern engineering."
          path="#"
        />
      </div>
    </section>
  );
};

export default EventsSection;
