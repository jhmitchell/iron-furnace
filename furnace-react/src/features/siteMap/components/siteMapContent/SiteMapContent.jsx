import React, { useState } from 'react';
import SiteMap from '/src/assets/maps/SiteMap';
import areaJSXMapping from './areaJSXMapping';
import styles from './SiteMapContent.module.css';

const SiteMapContent = () => {
  const [selectedArea, setSelectedArea] = useState(null);

  const handleAreaClick = (id) => {
    console.log(`Interactive area ${id} clicked`);
    setSelectedArea(id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.siteMapContainer}>
        <div className={styles.mapArea}>
          <SiteMap className={styles.siteMap} handleAreaClick={handleAreaClick}/>
        </div>
        <div className={styles.infoArea}>
          {selectedArea && areaJSXMapping[selectedArea] ? areaJSXMapping[selectedArea]() : <h2>Click on an area of the map to see more information.</h2>}
        </div>
      </div>
    </div>
  );
}

export default SiteMapContent;
