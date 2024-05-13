import React from 'react';
import styles from './Hours.module.css';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';
import OpenBanner from '../openBanner/OpenBanner';
import entranceImage from '/src/assets/images/museum.jpeg';
import useResponsive from '/src/hooks/useResponsive';

const ListItem = ({ label, value }) => (
  <div className={styles.listItem}>
    <span className={styles.label}>{label}:</span>
    <span className={styles.value}>{value}</span>
  </div>
);

const Hours = () => {
  const { isMobile } = useResponsive();

  return (
    <ScrollableSection className={styles.hoursSection} id="museum-hours-section" title="Visit Us">
      <div className={styles.cardContainer}>
        {!isMobile && <div className={styles.imageSection} style={{ backgroundImage: `url(${entranceImage})` }} />}
        <div className={styles.infoSection}>
          <h2 className={styles.title}>Museum Hours</h2>
          <OpenBanner id="open-banner" />
          <div className={styles.horizontalLine}></div>
          <div className={styles.listContainer}>
            {["Monday", "Tuesday", "Wednesday", "Thursday"].map(day => (
              <ListItem key={day} label={day} value="Closed" />
            ))}
            <ListItem label="Friday" value="9:00 am - 4:00 pm" />
            <ListItem label="Saturday" value="9:00 am - 4:00 pm" />
            <ListItem label="Sunday" value="12:00 pm - 4:00 pm" />
          </div>
          <div className={styles.horizontalLine}></div>
          <div className={styles.listContainer}>
            <ListItem label="Regular (12-64)" value="$8.00" />
            <ListItem label="Youth (2-11)" value="$4.00" />
            <ListItem label="Reduced (65+ and motor club members)" value="$7.00" />
            <ListItem label="Children (2 and under)" value="Free" />
          </div>
        </div>
      </div>
    </ScrollableSection>
  );
};

export default Hours;
