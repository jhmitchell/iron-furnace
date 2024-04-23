import React, { useState, useEffect } from "react";
import { getAllEvents, groupEventsByDate } from "../../services/eventService";
import EventDetailCard from "../eventDetailCard/EventDetailCard";
import styles from "./EventSchedule.module.css";

const EventSchedule = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const events = await getAllEvents();
      setEvents(events);
    }
    fetchEvents();
  }, []);

  const eventsByDate = groupEventsByDate(events);

  return (
    <div className={styles.eventSchedule}>
      {Array.from(eventsByDate.entries()).map(([year, monthMap]) => (
        <div key={year} className={styles.yearSection}>
          {Array.from(monthMap.entries()).map(([month, monthEvents]) => (
            <div key={`${year}-${month}`} className={styles.monthSection}>
              <div className={styles.monthContent}>
                <h3 className={styles.monthTitle}>{month} {year}</h3>
              </div>
              {monthEvents.map((event, index) => (
                <EventDetailCard
                  key={index}
                  event={event}
                  isLastCard={index === monthEvents.length - 1}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EventSchedule;
