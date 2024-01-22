import React from 'react';
import LineHeader from '/src/components/ui/lineHeader/LineHeader';
import styles from './ScrollableSection.module.css';

const ScrollableSection = ({ title, id, children }) => (
  <section id={id} className={styles.scrollableSection}>
    <LineHeader title={title} />
    <div className={styles.contentWrapper}>
        {children}
    </div>
  </section>
);

export default ScrollableSection;
