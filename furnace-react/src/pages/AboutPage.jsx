import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import { AboutHero, AboutContent } from '/src/features/about';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const sections = [
    { name: 'ABOUT THE FURNACE', subroute: 'history', id: 'history-section' },
    { name: 'HOLDINGS', subroute: 'holdings', id: 'holdings-section' },
    { name: 'GALLERY', subroute: 'gallery', id: 'gallery-section' },
  ];

  return (
    <MainLayout>
      <AboutHero />
      <SectionNavigator basePath="about" sections={sections}>
        <div className={styles.aboutPage}>
          <div className={styles.contentContainer}>
            <AboutContent />
          </div>
        </div>
      </SectionNavigator>
    </MainLayout>
  );
};

export default AboutPage;
