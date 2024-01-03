import React, { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import SecondaryNavbar from "/src/layouts/secondaryNavbar/SecondaryNavbar";

/**
 * The SectionNavigator component handles the scrolling to different sections
 * based on the URL and displays a secondary navbar with the sections provided.
 *
 * @param {Object} props - Component props
 * @param {string} props.basePath - The base URL path this navigator is handling (e.g. 'support')
 * @param {Array} props.sections - Array of section objects each containing a `subroute` and an `id` field
 * @param {React.Node} props.children - Children elements to render
 * @returns {React.Element} JSX element
 */
const SectionNavigator = ({ basePath, sections, children }) => {
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  // Creates a map of subroute to section id for quick lookup
  const sectionMap = sections.reduce((acc, section) => {
    acc[section.subroute] = section.id;
    return acc;
  }, {});

  /**
   * useEffect to handle the navigation and scrolling behavior.
   *
   * This effect checks the current URL path and scrolls to the
   * appropriate section in the page. If the last part of the path matches
   * the basePath, it scrolls to the top.
   *
   * @param {Object} location - The `useLocation` object from `react-router-dom`.
   * @param {string} basePath - The base URL path this navigator is handling (e.g. 'support').
   * @param {Object} sectionMap - A map of subroutes to section IDs for quick lookup.
   */
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    const navbarHeight = 70;

    if (sectionMap[lastPart]) {
      // Scroll to the respective section
      const sectionId = sectionMap[lastPart];
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth" });

        // Adjust the scroll position to account for the fixed navbar
        const y =
          sectionElement.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight
          - 60;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else if (lastPart === basePath) {
      // Scroll to top if it is the base path
      window.scrollTo(0, 0);
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
