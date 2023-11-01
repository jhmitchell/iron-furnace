import React from "react";
import "./AccessibilityContent.css";

/**
 * The AccessibilityContent component renders information regarding accessibility accommodations
 * and facilities available for visitors.
 *
 * @returns {React.Element} JSX element
 */
const AccessibilityContent = () => {
  return (
    <div className="accessibility-content">
      <div className="accessibility-content-container">
        <h2 className="section-header">Accessibility Information</h2>
        <p>
          Cornwall Iron Furnace welcomes all visitors and seeks to provide
          reasonable accommodations for those in need of special assistance.
          Individuals with disabilities who need special assistance or
          accommodations should call
          <a href="tel:+17172729711" className="accessibility-link">
            {" "}717-272-9711{" "}
          </a>
          or email
          <a href="mailto:memery@pa.gov" className="accessibility-link">
            {" "}memery@pa.gov{" "}
          </a>
          in advance.
        </p>

        <h3>Parking</h3>
        <p>
          Parking is free. The driveway and parking lot are paved. Accessible
          Parking Spaces are located at the walkway into the Visitors Center.
        </p>
        <h3>Facilities</h3>
        <p>Walkways are paved.</p>
        <p>
          The Visitors Center indoor exhibit gallery, video viewing area, and
          museum store are all handicap and wheelchair accessible.
        </p>
        <p>
          Restrooms are located in the Visitors Center and are handicapped
          accessible.
        </p>
        <h3>Audio and Visual Accessibility</h3>
        <p>
          A narrated Video has close captioning enabled for our visitors with
          hearing impairments.
        </p>
        <h3>Tours</h3>
        <p>
          Tours of the Furnace Building requires navigation of approximately 100
          steps. There is a room with a ______ inch step that visitors can see
          as part of their tour. Walkers are permitted in the Charging Room. The
          floor is rough and uneven.
        </p>
        <p>
          Walkers, Wheelchairs, and Strollers are not permitted in the Furnace
          Building due to limited accessibility.
        </p>
        <h3>Animals</h3>
        <p>
          Service Animals are encouraged; Pets are not allowed in the buildings;
          Dogs are permitted on the grounds but must be on a leash.
        </p>
        <h3>Sensory Considerations</h3>
        <p>
          Sensory Friendly Spaces – Some spaces are quieter and less
          stimulating, while others may have low lights or loud noises.
        </p>
        <p>
          Temperature – There is no heat or air conditioning in the Furnace
          Building. Be sure to dress appropriately for the activities.
          Comfortable footwear is suggested for the guided tour.
        </p>
        <h3>Site Map</h3>
        <p>Maps of the site are provided at the visitor’s desk.</p>
      </div>
    </div>
  );
};

export default AccessibilityContent;
