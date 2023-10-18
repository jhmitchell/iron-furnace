import React from "react";
import { Button } from "/src/components/ui";
import "./Volunteer.css";
import contentImage from "/src/assets/images/furnace-top.webp"

/**
 * The Volunteer component renders the volunteer section,
 * comprising a description area and contact details.
 *
 * @returns {React.Element} JSX element
 */
const Volunteer = () => {
  return (
    <div className="volunteer-section" id="volunteer-section">
      <div className="description-content">
        <div className="left-side-content">
          <img
            src={contentImage}
            alt="Volunteer at Cornwall Iron Furnace"
          />
        </div>
        <div className="right-side-content">
          <h2 className="left-aligned-title">Volunteer Opportunities</h2>
          <div className="text-content">
            <p>
              Volunteers at the Furnace often serve as the face of our site,
              sharing their passion for Cornwall history with thousands of
              visitors annually. They provide a helpful presence as tour guides,
              researchers, fund raisers, museum store workers, and board
              members.
            </p>
            <div className="contact-box">
              <p>
                To learn more about volunteering at the Cornwall Iron Furnace,
                contact our Site Administrator, Michael Emery, at{" "}
                <a href="tel:717-272-9711">717-272-9711</a> or{" "}
                <a href="mailto:memery@pa.gov">memery@pa.gov</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;
