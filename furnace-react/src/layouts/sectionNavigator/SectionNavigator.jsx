// SectionNavigator.jsx
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import SecondaryNavbar from "/src/layouts/secondaryNavbar/SecondaryNavbar";
import useScrollToSection from "/src/hooks/useScrollToSection";

const SectionNavigator = ({ basePath, sections, children }) => {
  const navRef = useRef(null);

  const sectionMap = sections.reduce((acc, section) => {
    acc[section.subroute] = section.id;
    return acc;
  }, {});

  useScrollToSection(sectionMap, basePath);

  return (
    <>
      <SecondaryNavbar ref={navRef} className={"sticky"}>
        {sections.map((section) => (
          <Link
            to={`/${basePath}/${section.subroute}`}
            className="nav-item"
            key={section.subroute}
          >
            {section.name}
          </Link>
        ))}
      </SecondaryNavbar>
      {children}
    </>
  );
};

export default SectionNavigator;
