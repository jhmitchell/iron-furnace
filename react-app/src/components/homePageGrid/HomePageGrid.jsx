import React from "react";
import "./HomePageGrid.css";

const HomePageGrid = () => {
  return (
    <div className="home-grid-container">
      <div className="home-grid">
        <div className="home-grid-element welcome">
          <h2>Welcome</h2>
          <p>
            Welcome to the Cornwall Iron Furnace, America’s most complete
            charcoal fueled ironmaking complex. The furnace operated from 1742
            to 1883 producing nearly 300 tons of iron each week at its peak in
            the late 18th century.
          </p>
          <p>
            Today, the Furnace stands as a symbol of Pennsylvania's industrial
            heritage and a tribute to the workers who helped make America a
            great industrial nation.
          </p>
        </div>
        <div className="home-grid-element events">
          <h2>Calendar</h2>
          <p>
            <strong>June 19, 2021</strong>
            <br />
            <em>Ironmaster's Mansion Tours</em>
            <br />
            11:00 a.m. to 3:00 p.m.
          </p>
        </div>
        <div className="home-grid-element hours">
          <h2>Hours of Operation</h2>
          <p>Open Wednesday through Sunday, 9:00 a.m. to 4:00 p.m.</p>
          <p>
            Guided tours are offered at 10:00 a.m., 12:00 p.m., and 2:00 p.m.
          </p>
          <p>Self-guided tours are available during regular business hours.</p>
          <p>For more information, please call 717-272-9711.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePageGrid;
