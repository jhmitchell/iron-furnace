import React from 'react';
import Hero from '../components/hero/Hero';
import HomePageGrid from '../components/homePageGrid/HomePageGrid';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homePage">
      <Hero />
      <HomePageGrid />
    </div>
  );
}

export default HomePage;
