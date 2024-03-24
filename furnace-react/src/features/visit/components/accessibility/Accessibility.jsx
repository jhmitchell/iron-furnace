import React from "react";
import { NavLink } from "react-router-dom";
import { TextLink } from "/src/components/ui";
import ScrollableSection from "/src/layouts/scrollableSection/ScrollableSection";
import "./Accessibility.css";

/**
 * The Accessibility component provides details about the accessibility of the site.
 *
 * @returns {React.Element} JSX element
 */
const Accessibility = () => {
  return (
    <ScrollableSection id="accessibility-section" title="Accessibility">
    <div className="accessibility-section">
      <p>
        While the Vistor Center and interpretive display are accessible, the
        tour of the furnace building is not as it requires the use of many
        steps.
      </p>
      <p>
        The temperature in the furnace structure can vary widely as there is no
        heat or a/c. Please dress accordingly.
        {" "}<TextLink to="/accessibility">Click Here</TextLink>{" "}
        for more information about accessibility.
      </p>
    </div>
    </ScrollableSection>
  );
};

export default Accessibility;
