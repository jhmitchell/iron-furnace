import React from 'react';
import { Hero, WelcomeFlex } from '../features/home';
import BlankSection from '../components/blankSection/BlankSection';
import MainLayout from '../layouts/MainLayout';
import './HomePage.css';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="home-page">
        <div className="hero-section">
          <Hero />
          <WelcomeFlex />
        </div>
        <BlankSection />
      </div>
    </MainLayout>
  );
}

export default HomePage;
