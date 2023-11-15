import React from "react";
import "./Hours.css";
import OpenBanner from "../openBanner/OpenBanner";

/**
 * The Hours component renders the operational hours and ticket prices of the site.
 *
 * @returns {React.Element} JSX element
 */
const Hours = () => {
  return (
    <div className="hours-section" id="hours-section">
      <p className="description">
        Located in the heart of Cornwall, Pennsylvania, the Cornwall Iron
        Furnace spans 5 acres, serving as a monumental testament to the
        Industrial Age in America. The site is open to the public year-round.
      </p>
      <div className="horizontal-line"></div>
      <OpenBanner id="open-banner"/>
      <div className="columns">
        <div className="column hours-content">
          <h3>Site Hours</h3>
          <div className="hours-list">
            <div>
              <span className="day">Monday:</span>
              <span className="time">Closed</span>
            </div>
            <div>
              <span className="day">Tuesday:</span>
              <span className="time">Closed</span>
            </div>
            <div>
              <span className="day">Wednesday:</span>
              <span className="time">Closed</span>
            </div>
            <div>
              <span className="day">Thursday:</span>
              <span className="time">Closed</span>
            </div>
            <div>
              <span className="day">Friday:</span>
              <span className="time">9:00 am - 4:00 pm</span>
            </div>
            <div>
              <span className="day">Saturday:</span>
              <span className="time">9:00 am - 4:00 pm</span>
            </div>
            <div>
              <span className="day">Sunday:</span>
              <span className="time">12:00 pm - 4:00 pm</span>
            </div>
          </div>
        </div>
        <div className="column ticket-content">
          <h3>Ticket Prices</h3>
          <div className="ticket-list">
            <div>
              <span className="ticket-category">Regular (12-64):</span>
              <span className="price">$8.00</span>
            </div>
            <div>
              <span className="ticket-category">Youth (2-11):</span>
              <span className="price">$4.00</span>
            </div>
            <div>
              <span className="ticket-category">
                Reduced (65+ and motor club members):
              </span>
              <span className="price">$7.00</span>
            </div>
            <div>
              <span className="ticket-category">Children (2 and under):</span>
              <span className="price">Free</span>
            </div>
            <div className="ebt-discount">
              <span className="ticket-category">
                Discounted Admission with Valid EBT Card
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hours;