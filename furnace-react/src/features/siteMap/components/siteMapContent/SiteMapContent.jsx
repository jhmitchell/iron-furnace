import React, { useState } from 'react';
import SiteMap from '/src/assets/maps/SiteMap';
import areaJSXMapping from './areaJSXMapping';
import styles from './SiteMapContent.module.css';

const SiteMapContent = () => {
  const [selectedArea, setSelectedArea] = useState(null);

  const handleAreaClick = (id) => {
    //console.log(`Interactive area ${id} clicked`);
    setSelectedArea(id);
  };

  const renderAreaInformation = () => {
    if (selectedArea && areaJSXMapping[selectedArea]) {
      return areaJSXMapping[selectedArea]();
    }

    return (
      <div className={styles.defaultMessageContainer}>
        <h2 className={styles.defaultMessage}>Explore the Cornwall Iron Furnace grounds by clicking on the interactive map to your left.</h2>
      </div>
    );
  };

  return (
    <div className={styles.siteMapContainer}>
      <div className={styles.card}>
        <div className={styles.mapArea}>
          <SiteMap className={styles.siteMap} handleAreaClick={handleAreaClick} />
        </div>
        <div className={styles.infoArea}>
          {renderAreaInformation()}
        </div>
      </div>
    </div>
  )
}

export default SiteMapContent;
