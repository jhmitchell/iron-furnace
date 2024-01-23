import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PictureLink.module.css';

const PictureLink = ({ image, link, children, containerHeight }) => (
  <div className={styles.pictureLink}>
    <Link to={link} className={styles.fullLink}>
      <img src={image} alt={children && "Image caption"} className={styles.image} />
      {children && <div className={styles.caption}>{children}</div>}
    </Link>
  </div>
);

export default PictureLink;
