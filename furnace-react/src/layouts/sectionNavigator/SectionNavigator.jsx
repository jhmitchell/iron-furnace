import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import SecondaryNavbar from '/src/layouts/secondaryNavbar/SecondaryNavbar';
import useScrollToSection from '/src/hooks/useScrollToSection';
import styles from './SectionNavigator.module.css';

const SectionNavigator = ({ basePath, sections, children }) => {
  const navRef = useRef(null);

  const sectionMap = sections.reduce((acc, section) => {
    acc[section.subroute] = section.id;
    return acc;
  }, {});

  useScrollToSection(sectionMap, basePath);

  return (
    <>
      <SecondaryNavbar ref={navRef} className={styles.sticky}>
        <div className={styles.secondaryNavContainer}>
          {sections.map((section) => (
            <Link
              to={`/${basePath}/${section.subroute}`}
              className={styles.navItem}
              key={section.subroute}
            >
              {section.name}
            </Link>
          ))}
        </div>
      </SecondaryNavbar>
      {children}
    </>
  );
};

export default SectionNavigator;
