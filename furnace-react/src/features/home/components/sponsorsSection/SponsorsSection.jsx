import { useEffect, useState } from "react";
import "@fontsource/eb-garamond/latin-500.css";
import { Button } from "/src/components/ui";
import { getAllSponsors, SponsorList } from "/src/features/sponsors";
import styles from "./SponsorsSection.module.css";

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    getAllSponsors()
      .then(setSponsors)
      .catch(console.error);
  }, []);

  // Don't render an empty section
  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className={styles.sponsorsSection} aria-labelledby="home-sponsors-title">
      <div className={styles.contentContainer}>
        <p className={styles.eyebrow}>With gratitude</p>
        <h2 id="home-sponsors-title" className={styles.sectionTitle}>Thank You to Our Sponsors</h2>
        <p className={styles.sectionSubtitle}>
          These local businesses and friends help us preserve and share Cornwall Iron Furnace.
        </p>
        <div className={styles.ornament} aria-hidden="true">
          <span />
        </div>
        <SponsorList sponsors={sponsors} />
        <div className={styles.cta}>
          <Button color="transparent" text="BECOME A SPONSOR" to="/support/sponsorship" />
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
