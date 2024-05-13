import React, { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import SecondaryNavbar from "/src/layouts/secondaryNavbar/SecondaryNavbar";

const SectionNavigator = ({ basePath, sections, children }) => {
  const navRef = useRef(null);
  const location = useLocation();

  const sectionMap = sections.reduce((acc, section) => {
    acc[section.subroute] = section.id;
    return acc;
  }, {});

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
  
    if (sectionMap[lastPart]) {
      const sectionId = sectionMap[lastPart];
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (lastPart === basePath) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location, basePath, sectionMap]);

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