import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Expander.css";

const Expander = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={`expander-section ${isExpanded ? "expanded" : ""}`}>
      <div onClick={toggleExpanded} className="expander-header">
        {isExpanded ? (
          <FaChevronUp className="arrow" />
        ) : (
          <FaChevronDown className="arrow" />
        )}
        <h3 className="expander-title">{title}</h3>
      </div>
      {isExpanded && <div className="expander-content">{children}</div>}
    </div>
  );
};

export default Expander;