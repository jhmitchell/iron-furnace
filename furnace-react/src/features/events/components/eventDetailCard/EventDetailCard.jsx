import React from "react";
import { Link } from "react-router-dom";
import styles from "./EventDetailCard.module.css";

const EventDetailCard = ({ event, isLastCard }) => {
  const { id, title, start_date, description, link_text, image } = event || {};
  const defaultDate = "Date not available";
  const path = link_text ? `/events/${id}` : "#";
  const formattedDate = start_date ? formatDate(start_date) : defaultDate;

  return (
    <Link to={path} className={styles.linkWrapper}>
      <div className={styles.cardContainer}>
        <div
          className={`${styles.cardContent} ${
            isLastCard ? styles.lastCard : ""
          }`}
        >
          <div className={styles.mediaImage} style={{ backgroundImage: `url(${image})` }}></div>
          <div className={styles.eventDetails}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <p className={styles.date}>
              <span>{formattedDate}</span>
            </p>
            <p className={styles.linkText}>{link_text}</p>
            {/* Include other event details as needed */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventDetailCard;

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
}
