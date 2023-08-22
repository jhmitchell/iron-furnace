import React from 'react';
//import heroImage from '../../../../../assets/images/hero_demo_2.png';
import heroImage from '../../../../../assets/images/entrance.jpg';
import './HeroImage.css';

const HeroImage = () => {
    const gradient = 'linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 32%, rgba(0, 0, 0, 0.3) 68%, rgba(0,0,0,0.5) 70%, rgba(0, 0, 0, 0.6) 100%)';
    const filter = 'contrast(0.95)';
  
    const heroImageStyle = {
      background: `${gradient}, url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: filter,
    };
  
    return (
      <div className="hero-image" style={heroImageStyle}/>
    );
  }
  
  export default HeroImage;
  