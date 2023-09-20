import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import NotFound from "/src/pages/NotFound";
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
  const [isValidPath, setIsValidPath] = useState(true);
  const location = useLocation();

  // Creates a map of subroute to section id for quick lookup
  const sectionMap = sections.reduce((acc, section) => {
    acc[section.subroute] = section.id;
    return acc;
  }, {});

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];

    // Scroll to top if it is the base path
    if (lastPart === basePath) {
      window.scrollTo(0, 0);
      setIsValidPath(true);
    } else if (sectionMap[lastPart]) {
      // Scroll to the respective section
      const sectionId = sectionMap[lastPart];
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth" });
      }
      setIsValidPath(true);
    } else {
      // If path is not valid, set isValidPath to false
      setIsValidPath(false);
    }
  }, [location]);

  return (
    <>
      {isValidPath ? (
        <>
          <SecondaryNavbar>
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
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default SectionNavigator;