import React from 'react';
import './HomePageGrid.css';

const HomePageGrid = () => {
  return (
    <div className="homePageContent">
      <div className="homePageContentLeft">
        <h2>Welcome to the Cornwall Iron Furnace!</h2>
        <p>Located in southern Lebanon County, Cornwall Iron Furnace is an extraordinary example of the furnaces that dotted the Pennsylvania countryside in the 18th and 19th centuries. Around it developed villages, artisans' shops, stores, schools, churches, and, of course, the homes of the ironmasters, managers, and workers.</p>
        <p>Today, the Furnace stands as a symbol of Pennsylvania's industrial heritage and a tribute to the workers who helped make America a great industrial nation.</p>
      </div>
      <div className="homePageContentRight">
        <h2>Hours of Operation</h2>
        <p>Open Wednesday through Sunday, 9:00 a.m. to 4:00 p.m.</p>
        <p>Guided tours are offered at 10:00 a.m., 12:00 p.m., and 2:00 p.m.</p>
        <p>Self-guided tours are available during regular business hours.</p>
        <p>For more information, please call 717-272-9711.</p>
      </div>
    </div>
  );
}

export default HomePageGrid;
