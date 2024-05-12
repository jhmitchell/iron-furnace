import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import { PostHero, PostContent } from '/src/features/blog';
import styles from './UpcomingFeatures.module.css';

const UpcomingFeatures = () => {
	return (
		<MainLayout>
			<div className={styles.page}>
				<PostHero />
				<PostContent />
			</div>
		</MainLayout>
	);
};

export default UpcomingFeatures;
