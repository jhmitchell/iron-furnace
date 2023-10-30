import React from "react";
import { Button } from "/src/components/ui";
import "./Sponsorship.css";

/**
 * The Sponsorship component renders the sponsorship section,
 * comprising a description area and sponsorship options.
 *
 * @returns {React.Element} JSX element
 */
const Sponsorship = () => {
  return (
    <div className="sponsorship-section" id="sponsorship-section">
      <div className="description-content">
        <div className="left-side-content">
          <h2 className="left-aligned-title">Corporate Sponsorship Opportunities</h2>
          <div className="text-content">
            <p>
              Sponsorship provides a unique opportunity for businesses and individuals 
              to support the Furnace while enjoying valuable benefits. 
              Your sponsorship helps maintain our site and extend our educational outreach.
            </p>
            <div className="sponsorship-options">
              <Button color="orange" text="BECOME A SPONSOR" />
            </div>
          </div>
        </div>
        <div className="right-side-content">
          <img
            src="/src/assets/images/sponsorship-image.webp"
            alt="Sponsor the Cornwall Iron Furnace"
          />
        </div>
      </div>
    </div>
  );
};

export default Sponsorship;
