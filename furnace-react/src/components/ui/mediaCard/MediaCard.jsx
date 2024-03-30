import React from "react";
import { Link } from "react-router-dom";
import styles from "./MediaCard.module.css"; // Updated import

const MediaCard = ({ image, title, subtitle, description, path, children }) => {
  return (
    <Link to={path} className={styles.mediaCard}>
      <div className={styles.mediaImage} style={{ backgroundImage: `url(${image})` }}></div>
      <div className={styles.mediaDetails}>
        <h3 className={styles.mediaTitle}>{title}</h3>
        <p className={styles.mediaSubtitle}>{subtitle}</p>
        {description && <p className={styles.mediaDescription}>{description}</p>}
        {children}
      </div>
    </Link>
  );
};

export default MediaCard;
