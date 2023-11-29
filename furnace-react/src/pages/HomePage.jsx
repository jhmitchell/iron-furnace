import React from "react";
import { Hero, WelcomeFlex, QuoteSection, EventsSection, VideoSection } from "../features/home";
import BlankSection from "../components/blankSection/BlankSection";
import MainLayout from "../layouts/MainLayout";
import "./HomePage.css";

const HomePage = () => {
  return (
    <MainLayout>
      <div className="home-page">
        <section className="hero-section">
          <Hero />
          <WelcomeFlex />
        </section>
        <EventsSection />
        <QuoteSection />
        <VideoSection />
      </div>
    </MainLayout>
  );
};

export default HomePage;
