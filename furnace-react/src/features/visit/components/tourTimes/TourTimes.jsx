import React from "react";
import "./TourTimes.css";

/**
 * The TourTimes component renders the available tour times for the site.
 *
 * @returns {React.Element} JSX element
 */
const TourTimes = () => {
  return (
    <div className="tour-times-section" id="tour-times-section">
      <div className="horizontal-line"></div>
      <h2 className="section-header">Furnace Tours</h2>
      <div className="columns">
        <div className="column description-column">
          <p className="description">
            Explore the historic furnace with our guided tours. Due to limited
            space, we recommend calling ahead for a reservation.
          </p>
          <p className="reservation-note">
            Please call{" "}
            <a className="phone-link" href="tel:7172729711">
              717-272-9711
            </a>{" "}
            to reserve a spot. Arrive 15 minutes before your scheduled tour
            time.
          </p>
        </div>
        <div className="column tour-content-column">
          <h3>Tour Times</h3>
          <div className="tour-list">
            <div>
              <span className="day">Friday:</span>
              <span className="time">9:30, 11:00, 12:30, and 2:00</span>
            </div>
            <div>
              <span className="day">Saturday:</span>
              <span className="time">9:30, 11:00, 12:30, and 2:00</span>
            </div>
            <div>
              <span className="day">Sunday:</span>
              <span className="time">12:30 & 2:30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourTimes;
