import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useScrollToSection = (sectionMap) => {
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];

    if (sectionMap[lastPart]) {
      const sectionId = sectionMap[lastPart];
      const sectionElement = document.getElementById(sectionId);

      if (sectionElement) {
        const offset = sectionElement.offsetTop - 130;

        // Cancel any ongoing scroll animation
        window.cancelAnimationFrame(window.scrollToSectionAnimationId);

        // Initiate a new smooth scrolling animation
        const scrollToSection = () => {
          const currentPosition = window.scrollY;
          const distance = offset - currentPosition;
          const duration = 500; // Adjust the duration as needed
          let start = null;

          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            const easing = easeInOutCubic(percentage);
            window.scrollTo(0, currentPosition + distance * easing);

            if (progress < duration) {
              window.scrollToSectionAnimationId = window.requestAnimationFrame(step);
            }
          };

          window.scrollToSectionAnimationId = window.requestAnimationFrame(step);
        };

        scrollToSection();
      }
    }
  }, [location, sectionMap]);
};

// Easing function for smooth scrolling
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

export default useScrollToSection;
