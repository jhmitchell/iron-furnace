import React from "react";
import EventCard from "./eventsCard/EventsCard";
import "./EventsSection.css";

const EventsSection = () => {
  return (
    <section className="events-section">
    <div className="content-container"> {/* Added content container */}
      <h2 className="section-title">Upcoming Events</h2>
      <div className="events-flex">
        <EventCard
          image="/src/assets/images/events/jim2023.jpg"
          title="Industrial Innovation Conference"
          date="September 10, 2023"
          description="Join us for a day of insights into the world of industrial innovation."
          path="#"
        />
        <EventCard
          image="/src/assets/images/events/patrick2023.jpg"
          title="Cornwall Heritage Festival"
          date="October 5, 2023"
          description="Celebrate the rich heritage of Cornwall with food, music, and art."
          path="#"
        />
        <EventCard
          image="/src/assets/images/events/mike2023.jpg"
          title="Sustainable Engineering Workshop"
          date="November 18, 2023"
          description="A hands-on workshop focused on sustainable practices in modern engineering."
          path="#"
        />
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
