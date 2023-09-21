import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import SectionNavigator from '/src/layouts/sectionNavigator/SectionNavigator';
import NotFound from '/src/pages/NotFound'; // Import NotFound component
import { SupportHero, Membership } from '/src/features/support';
import { useLocation } from 'react-router-dom';
import './SupportPage.css';
/**
 * The SupportPage component renders the content and navigation for the support page.
 * It makes use of the SectionNavigator for handling section scrolling and displaying the secondary navbar.
 * 
 * @returns {React.Element} JSX element
 */
const SupportPage = () => {
  const sections = [
    { name: 'MEMBERSHIP', subroute: 'membership', id: 'membership-section' },
    { name: 'DONATE', subroute: 'donate', id: 'donate-section' },
    { name: 'VOLUNTEER', subroute: 'volunteer', id: 'volunteer-section'},
    { name: 'CORPORATE SPONSORSHIP', subroute: 'sponsorship', id: 'sponsorship-section'}
  ];

  return (
    <MainLayout>
      <SupportHero />
      <SectionNavigator basePath="support" sections={sections}>
        <Membership id="membership-section" />
      </SectionNavigator>
    </MainLayout>
  );
};

export default SupportPage;
