import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import { AboutHero, AboutContent } from '/src/features/about';

/**
 * The AboutPage component renders the content and navigation for the about page.
 * It makes use of the SectionNavigator for handling section scrolling and displaying the secondary navbar.
 * 
 * @returns {React.Element} JSX element
 */
const AboutPage = () => {
  const sections = [
    { name: 'HISTORY', subroute: 'history', id: 'history-section' },
    { name: 'HOLDINGS', subroute: 'holdings', id: 'holdings-section' },
    { name: 'ASSOCIATES', subroute: 'associates', id: 'associates-section' },
    { name: 'GALLERY', subroute: 'gallery', id: 'gallery-section' },
  ];

  return (
    <MainLayout>
      <AboutHero />
      <SectionNavigator basePath="about" sections={sections}>
        <AboutContent />
      </SectionNavigator>
    </MainLayout>
  );
};

export default AboutPage;
