import React from 'react';
import Hero from '../components/hero/Hero';
import HomePageGrid from '../components/homePageGrid/HomePageGrid';
import BlankSection from '../components/blankSection/BlankSection';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <Hero />
        <HomePageGrid />
      </div>
      <BlankSection />
    </div>
  );
}

export default HomePage;
