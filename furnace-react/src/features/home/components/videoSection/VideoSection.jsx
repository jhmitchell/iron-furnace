import React from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import styles from "./VideoSection.module.css";
import useWindowSize from '../../services/useWindowSize';

const VideoSection = () => {
  // List of Video IDs - will pull from backend
  const videoIds = ["8IJu6yMUQF4", "lmb7jrxW2oY"];
  const youtubeChannelUrl = "https://www.youtube.com/@cornwallironfurnace6291";

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const windowSize = useWindowSize();

  const calculateVideoHeight = () => {
    const fullScreenHeight = 400;
    const minHeight = 200;
    const screenWidth = windowSize.width || window.innerWidth;
    const calculatedHeight = (screenWidth / 1920) * fullScreenHeight;
    return Math.max(calculatedHeight, minHeight);
  };

  const CustomLeftArrow = ({ onClick }) => (
    <button className={styles.customLeftArrow} onClick={onClick} style={{ top: `${calculateVideoHeight() / 2}px` }}>
      <FaChevronLeft size={50} color="orange" />
    </button>
  );

  const CustomRightArrow = ({ onClick }) => (
    <button className={styles.customRightArrow} onClick={onClick} style={{ top: `${calculateVideoHeight() / 2}px` }}>
      <FaChevronRight size={50} color="orange" />
    </button>
  );

  return (
    <section className={styles.videoSection}>
      <div className={styles.contentContainer}>
        <h2 className={styles.sectionTitle}>Featured Videos</h2>
        <a href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className={styles.seeMore}>
          Visit our YouTube channel {">"}
        </a>
        <div className={styles.videoContainer}>
          <Carousel
            responsive={responsive}
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
            additionalTransfrom={0}
            arrows
            autoPlay
            autoPlaySpeed={5000}
            centerMode={false}
            className={styles.videoCarousel}
            containerClass={styles.videoCarouselContainer}
            dotListClass=""
            draggable
            focusOnSelect={false}
            infinite
            itemClass={styles.videoContainerItem}
            keyBoardControl
            minimumTouchDrag={80}
            pauseOnHover
            renderArrowsWhenDisabled={false}
            renderButtonGroupOutside={false}
            renderDotsOutside={true}
            rewind={false}
            rewindWithAnimation={false}
            rtl={false}
            shouldResetAutoplay
            showDots={false}
            sliderClass=""
            slidesToSlide={1}
            swipeable
          >
            {videoIds.map((videoId, index) => (
              <div className={styles.videoWrapper} key={index}>
                <iframe
                  title={`Video ${index + 1}`}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                  loading="lazy"
                ></iframe>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;