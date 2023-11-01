import React from "react";
import { NavLink } from "react-router-dom";
import "./Accessibility.css";

/**
 * The Accessibility component provides details about the accessibility of the site.
 *
 * @returns {React.Element} JSX element
 */
const Accessibility = () => {
  return (
    <div className="accessibility-section" id="accessibility-section">
      <div className="horizontal-line"></div>
      <h2 className="section-header">Accessibility</h2>
      <p>
        While the visitor center and interpretive display are accessible, the
        tour of the furnace building is not as it requires the use of many
        steps.
      </p>
      <p>
        The temperature in the furnace structure can vary widely as there is no
        heat or a/c. Please dress accordingly.{" "}
        <NavLink className="accessibility-link" to="/accessibility">
          Click Here
        </NavLink>{" "}
        for more information about accessibility.
      </p>
    </div>
  );
};

export default Accessibility;
