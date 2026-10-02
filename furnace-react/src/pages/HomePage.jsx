import { Hero, WelcomeFlex, QuoteSection, EventsSection, VideoSection, SponsorsSection } from "../features/home";
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
        <SponsorsSection />
      </div>
    </MainLayout>
  );
};

export default HomePage;
