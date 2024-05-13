import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import { VisitHero, Hours, TourTimes, Accessibility } from '/src/features/visit';
import styles from './VisitPage.module.css';

const VisitPage = () => {
  const sections = [
    { name: 'HOURS / TICKETS', subroute: 'hours', id: 'hours-section' },
    { name: 'TOURS', subroute: 'tours', id: 'tour-times-section' },
    { name: 'ACCESSIBILITY', subroute: 'accessibility', id: 'accessibility-section' },
  ];

  return (
    <MainLayout>
      <VisitHero />
      <SectionNavigator basePath="visit" sections={sections}>
        <div className={styles.visitPage}>
          <div className={styles.contentContainer}>
            <Hours id="visit-section" />
            <TourTimes id="tour-times-section" />
            <Accessibility id="accessibility-section" />
          </div>
        </div>
      </SectionNavigator>
    </MainLayout>
  );
};

export default VisitPage;