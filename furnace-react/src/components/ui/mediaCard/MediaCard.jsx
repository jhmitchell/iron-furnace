import React from "react";
import { Link } from "react-router-dom";
import styles from "./MediaCard.module.css"; // Updated import

const MediaCard = ({ image, title, subtitle, description, linkText, path, clickable, children }) => {
  const CardContainer = clickable ? Link : 'div';
  const cardProps = clickable ? { to: path } : {};
  
  return (
    <CardContainer {...cardProps} className={styles.mediaCard}>
      <div className={styles.mediaImage} style={{ backgroundImage: `url(${image})` }}></div>
      <div className={styles.mediaDetails}>
        <h3 className={styles.mediaTitle}>{title}</h3>
        <p className={styles.mediaSubtitle}>{subtitle}</p>
        {description && <p className={styles.mediaDescription}>{description}</p>}
        {children}
        {linkText && <p className={styles.linkText}>{linkText}</p>}
      </div>
    </CardContainer>
  );
};

export default MediaCard;
