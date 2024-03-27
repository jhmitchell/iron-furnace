import React from "react";
import { FaTrashAlt } from 'react-icons/fa';
import styles from "./HolidayEntry.module.css";

const HolidayEntry = ({ date, description, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.delete} onClick={() => onDelete(date)}>
        <FaTrashAlt />
      </div>
      <h4 className={styles.date}>{date}</h4>
      <p className={styles.description}>{description || "No description available"}</p>
    </div>
  );
}

export default HolidayEntry;
