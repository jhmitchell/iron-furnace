import React from 'react';
import styles from './AboutContent.module.css';

import HistorySection from '../historySection/HistorySection';
import HoldingsSection from '../holdingsSection/HoldingsSection';
import GallerySection from '../gallerySection/GallerySection';

/**
 * The AboutContent component renders the content for the about page.
 */
const AboutContent = () => {
	return (
		<div className={styles.aboutPage}>
			<div className={styles.aboutPageContent}>
				<HistorySection />
				<HoldingsSection />
				<GallerySection />
			</div>
		</div>
	);
}

export default AboutContent;