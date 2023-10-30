import React from "react";
import { Button } from "/src/components/ui";
import "./Donate.css";

/**
 * The Donate component renders the donate section,
 * comprising a description area and donation options.
 *
 * @returns {React.Element} JSX element
 */
const Donate = () => {
  return (
    <div className="donate-section" id="donate-section">
      <div className="description-content">
        <div className="left-side-content">
          <img
            src="/src/assets/images/donation-image.webp"
            alt="Support the Cornwall Iron Furnace"
          />
        </div>
        <div className="right-side-content">
          <h2 className="left-aligned-title">Support Us Through Donations</h2>
          <div className="text-content">
            <p>
              Your donation helps preserve the Cornwall Iron Furnace and supports our educational programs. 
              Every donation, no matter the amount, makes a significant impact.
            </p>
            <div className="donate-options">
            <Button color="orange" text="DONATE NOW" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
