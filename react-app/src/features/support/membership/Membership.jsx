import React from "react";
import "./Membership.css";

const Membership = () => {
  return (
    <div className="membership-section" id="membership-section">
      <h2>Why Become a Member?</h2>
      <p>Discover the benefits and perks of different membership tiers.</p>
      <div className="tiers">
        <div className="tier">
          <h3>Basic</h3>
          <p>Some description...</p>
        </div>
        <div className="tier">
          <h3>Pro</h3>
          <p>Some description...</p>
        </div>
        <div className="tier">
          <h3>Elite</h3>
          <p>Some description...</p>
        </div>
      </div>
    </div>
  );
};

export default Membership;
