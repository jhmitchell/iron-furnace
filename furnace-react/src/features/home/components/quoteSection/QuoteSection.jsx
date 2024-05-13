// QuoteSection.js
import React from "react";
import styles from "./QuoteSection.module.css";
import QuoteImage from "/src/assets/images/entrance.webp";

const QuoteSection = () => {
  return (
    <section className={styles.quoteSection} style={{ backgroundImage: `url(${QuoteImage})` }}>
      <div className={styles.quoteOverlay}></div>
      <div className={styles.quoteContainer}>
        <div className={styles.quote}>
          <p className={styles.quoteText}>A Site of Transcendent Significance.</p>
          <p className={styles.quoteContinuation}>
            With the exception of a mere handful of similar preservations in Sweden and Germany - and possibly a few in eastern Europe - I doubt that elsewhere in the world is there a 19th-century iron furnace complex with the degree of historical integrity to be found at Cornwall…
          </p>
          <p className={styles.quoteAuthor}>- Robert Vogel, Smithsonian Institution</p>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;