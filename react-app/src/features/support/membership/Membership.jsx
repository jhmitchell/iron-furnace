import React from "react";
import "./Membership.css";

/**
 * The Membership component renders the membership section, comprising of a description area and tier choices.
 *
 * @returns {React.Element} JSX element
 */
const Membership = () => {
  return (
    <div className="membership-section" id="membership-section">
      <div className="membership-description">
        <h2 className="left-aligned-title">Become a Member</h2>
        <div className="description-content">
          <div className="text-content">
            <p>
              There are many ways to support the Furnace, but keeping your membership current is
              most vital. Joining CIFA keeps you better informed of the news and events happening at
              the site. Please maintain your membership and consider inviting others to do the same.
              Check the mailing label on your Ledger for your membership expiration date and please
              renew in a timely manner.
            </p>
            <p>Discover the benefits and perks of different membership tiers.</p>
          </div>
          <div className="right-side-content">
            {/* You can put additional content here */}
          </div>
        </div>
      </div>
      <div className="membership-tiers">
        {/* Your tier cards here */}
      </div>
    </div>
  );
};

export default Membership;
