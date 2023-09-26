import React from "react";
import { Button } from "/src/components/ui";
import "./Membership.css";

/**
 * The Membership component renders the membership section, comprising of a 
 * description area and a link to the detailed membership page.
 *
 * @returns {React.Element} JSX element
 */
const Membership = () => {
  return (
    <div className="membership-section" id="membership-section">
      <div className="description-content">
        <div className="left-side-content">
          <h2 className="left-aligned-title">Open a Window to the Past</h2>
          <p className="friend-header">As a friend of Cornwall Iron Furnace…</p>
          <div className="text-content">
            <ul>
              <li>
                You are preserving our iconic and historic site for future
                generations.
              </li>
              <li>
                You are ensuring that Cornwall Iron Furnace remains accessible
                to visitors and students each year through educational
                programming and admission.
              </li>
              <li>
                You are helping to tell our century-old history to thousands of
                visitors each year.
              </li>
            </ul>
          </div>
        </div>
        <div className="right-side-content">
        <div className="membership-card">
            <p className="signin-text">Interested in becoming a member?</p>
            <Button color="orange" size="medium" text="JOIN/RENEW NOW" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
