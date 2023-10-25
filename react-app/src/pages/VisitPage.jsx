import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import { Donate, Sponsorship } from '/src/features/support';
import { VisitHero, Hours } from '/src/features/visit';
import './VisitPage.css';
/**
 * The SupportPage component renders the content and navigation for the support page.
 * It makes use of the SectionNavigator for handling section scrolling and displaying the secondary navbar.
 * 
 * @returns {React.Element} JSX element
 */
const VisitPage = () => {
  const sections = [
    { name: 'HOURS', subroute: 'hours', id: 'hours-section' },
    { name: 'TICKETS', subroute: 'tickets', id: 'tickets-section' },
    { name: 'ACCESSIBILITY', subroute: 'accessibility', id: 'accessibility-section' },
  ];

  return (
    <MainLayout>
      <VisitHero />
      <SectionNavigator basePath="visit" sections={sections}>
        <div className="visit-page">
          <div className="content-container">
            <Hours id="visit-section" />
            <Donate id="tickets-session" />
            <Sponsorship id="accessibility-section" />
          </div>
        </div>
      </SectionNavigator>
    </MainLayout>
  );
};

export default VisitPage;
