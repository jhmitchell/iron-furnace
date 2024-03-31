import React from "react";
import { FaTrashAlt } from 'react-icons/fa';
import styles from "./EventEntry.module.css";

const EventEntry = ({ event, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.delete} onClick={() => onDelete(event.id)}>
        <FaTrashAlt />
      </div>
      <h4 className={styles.date}>{formatDate(event.start_date)}</h4>
      <p className={styles.description}>{event.title || "No description available"}</p>
    </div>
  );
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
}

export default EventEntry;
