import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import { VisitHero, Hours, TourTimes, Accessibility } from '/src/features/visit';
import './VisitPage.css';
/**
 * The SupportPage component renders the content and navigation for the support page.
 * It makes use of the SectionNavigator for handling section scrolling and displaying the secondary navbar.
 * 
 * @returns {React.Element} JSX element
 */
const VisitPage = () => {
  const sections = [
    { name: 'HOURS/TICKETS', subroute: 'hours', id: 'hours-section' },
    { name: 'TOURS', subroute: 'tours', id: 'tour-times-section' },
    { name: 'ACCESSIBILITY', subroute: 'accessibility', id: 'accessibility-section' },
  ];

  return (
    <MainLayout>
      <VisitHero />
      <SectionNavigator basePath="visit" sections={sections}>
        <div className="visit-page">
          <div className="content-container">
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
