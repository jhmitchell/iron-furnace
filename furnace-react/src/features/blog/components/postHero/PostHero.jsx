import React from 'react';
import { TwoColumn } from '/src/layouts';
import WheelImg from '/src/assets/images/history-wheel.jpeg';
import styles from './PostHero.module.css';
import useResponsive from '/src/hooks/useResponsive';

const PostHero = () => {
  const { isMobile } = useResponsive();

  const HeroText = () => (
    <div className={`${styles.heroTextContainer} ${isMobile ? styles.mobileHeroTextContainer : ''}`}>
      <div className={`${styles.heroText} ${isMobile ? styles.mobileHeroText : ''}`}>
        <h1>Welcome!</h1>
        <p>
          We are excited to launch the new website for Cornwall Iron Furnace. Stay tuned for more updates and features as we continue to enhance your experience.
        </p>
      </div>
    </div>
  );

  const HeroImg = () => (
    <div className={styles.heroImgContainer}>
      <img src={WheelImg} alt="Cornwall Iron Furnace" />
    </div>
  );

  return (
    <>
      {isMobile ? (
        <div className={`${styles.blogHero} ${styles.mobileBlogHero}`}>
          <HeroText />
        </div>
      ) : (
        <TwoColumn
          className={styles.blogHero}
          leftContent={<HeroText />}
          rightContent={<HeroImg />}
        />
      )}
    </>
  );
};

export default PostHero;