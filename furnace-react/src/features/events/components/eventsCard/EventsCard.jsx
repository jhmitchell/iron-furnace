import React from "react";
import MediaCard from "/src/components/ui/mediaCard/MediaCard";
import styles from "./EventsCard.module.css";

const EventCard = ({ image, title, date, description, path }) => {
  return (
    <div className={styles.cardContainer}>
      <MediaCard
        image={image}
        title={title}
        subtitle={date}
        description={description}
        path={path}
      />
    </div>
  );
};

export default EventCard;
