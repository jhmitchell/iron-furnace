import React from "react";
import MediaCard from "/src/components/ui/mediaCard/MediaCard";
import styles from "./EventCard.module.css";
import DefaultEventImage from "/src/assets/images/chandelier.jpeg";

const EventCard = ({ event, imageHeight }) => {
  const defaultTitle = "Event Unavailable";
  const defaultDate = "Date TBD";
  const defaultDescription = "Description Unavailable";
  const defaultLinkText = null;

  // Destructure event object if it exists, otherwise use default values
  const {
    image = DefaultEventImage,
    title = defaultTitle,
    start_date: startDate = defaultDate,
    description = defaultDescription,
    link_text = defaultLinkText,
    id,
  } = event || {};

  const formattedDate = startDate !== defaultDate ? formatDate(startDate) : defaultDate;
  const path = link_text ? `/events/${id}` : "#";

  return (
    <div className={styles.cardContainer}>
      <MediaCard
        image={image}
        title={title}
        subtitle={formattedDate}
        description={description}
        path={path}
        clickable={link_text}
        linkText={link_text}
        imageHeight={imageHeight}
      />
    </div>
  );
};

export default EventCard;

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
}
