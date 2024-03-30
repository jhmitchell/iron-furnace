import React from "react";
import MediaCard from "/src/components/ui/mediaCard/MediaCard";
import styles from "./EventCard.module.css";
import DefaultEventImage from "/src/assets/images/chandelier.jpeg";

const EventCard = ({ event }) => {
  const defaultTitle = "Event Unavailable";
  const defaultDate = "Date TBD";
  const defaultDescription = "Description Unavailable";
  const defaultPath = "example";

  // Destructure event object if it exists, otherwise use default values
  const {
    image = DefaultEventImage,
    title = defaultTitle,
    start_date: startDate = defaultDate,
    description = defaultDescription,
    id,
  } = event || {};

  const formattedDate = startDate !== defaultDate ? formatDate(startDate) : defaultDate;
  const path = event ? `/events/${id}` : defaultPath;

  return (
    <div className={styles.cardContainer}>
      <MediaCard
        image={image}
        title={title}
        subtitle={formattedDate}
        description={description}
        path={path}
      />
    </div>
  );
};

export default EventCard;

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
}
