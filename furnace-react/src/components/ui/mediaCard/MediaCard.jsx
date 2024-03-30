import React from "react";
import { Link } from "react-router-dom";
import styles from "./MediaCard.module.css"; // Updated import

const MediaCard = ({ image, title, subtitle, description, path, children }) => {
  return (
    <Link to={path} className={styles.mediaCard}> {/* Updated className */}
      <div className={styles.mediaImage} style={{ backgroundImage: `url(${image})` }}></div> {/* Updated className */}
      <div className={styles.mediaDetails}> {/* Updated className */}
        <h3 className={styles.mediaTitle}>{title}</h3> {/* Updated className */}
        <p className={styles.mediaSubtitle}>{subtitle}</p> {/* Updated className */}
        {description && <p className={styles.mediaDescription}>{description}</p>} {/* Updated className */}
        {children}
      </div>
    </Link>
  );
};

export default MediaCard;
