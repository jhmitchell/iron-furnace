import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import { AboutHero } from '/src/features/about';
import styles from './AboutPage.module.css';

/**
 * The AboutPage component renders the content and navigation for the about page.
 * It makes use of the SectionNavigator for handling section scrolling and displaying the secondary navbar.
 * 
 * @returns {React.Element} JSX element
 */
const AboutPage = () => {
  const sections = [
    { name: 'HISTORY', subroute: 'history', id: 'history-section' },
  ];

  return (
    <MainLayout>
      <AboutHero />
      <SectionNavigator basePath="about" sections={sections}>
        <div className={styles.aboutPage}>
          
        </div>
      </SectionNavigator>
    </MainLayout>
  );
};

export default AboutPage;
