import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "/src/components/ui";
import contentImage from "/src/assets/images/furnace-sign-snow.jpg"
import "./Donate.css";

/**
 * The Donate component renders the donate section,
 * comprising a description area and donation options.
 *
 * @returns {React.Element} JSX element
 */
const Donate = () => {
  const navigate = useNavigate();

  const handleDonateClick = () => {
    navigate("/donate");
  }

  return (
    <div className="donate-section" id="donate-section">
      <div className="description-content">
        <div className="left-side-content">
          <img
            src={contentImage}
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
            <Button color="orange" text="DONATE NOW" onClick={handleDonateClick}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
