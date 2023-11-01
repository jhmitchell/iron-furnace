import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui";
import { useHours } from "/src/features/hours";

import "./Hours.css";

const Hours = () => {
  /*
  return (
    <div className="welcome-flex-element hours">
      <h2>Hours</h2>
      <div className="hours-content">
        <div className="hours-column">
          <strong>June - August</strong>
          <p>Wednesday to Saturday: 9 a.m. to 5 p.m.</p>
          <p>Sunday: noon to 5 p.m.</p>
        </div>
        <div className="hours-column">
          <strong>September - May</strong>
          <p>Thursday to Saturday: 9 a.m. to 5 p.m.</p>
          <p>Sunday: noon to 5 p.m.</p>
        </div>
      </div>
      <div className="last-tour">
        <p>Last tour leaves the Visitor’s Center at 3:15 p.m. each day</p>
      </div>
      <div className="closed">
        <p>
          <strong>CLOSED</strong> Mondays, Tuesdays, and all holidays
        </p>
      </div>
    </div>
  );
  */

  const { isOpen, loading } = useHours();

  // Render nothing while loading
  if (loading) return null;

  return (
    <div className="welcome-flex-element hours">
      <div className="status">
        <p>The museum is now {isOpen ? "OPEN" : "CLOSED"}</p>
      </div>
      <div className="visitor-info">
        <p>Open Friday through Sunday</p>
      </div>
      <Button text="PLAN YOUR VISIT" color="orange" />
    </div>
  );
};

export default Hours;
