import React from 'react';
import { EventsHero, EventSchedule } from '/src/features/events';
import MainLayout from '/src/layouts/MainLayout';
import styles from './EventsPage.module.css';

const EventsPage = () => {
	return (
		<MainLayout>
			<EventsHero />
			<div className={styles.page}>
				<EventSchedule />
			</div>
		</MainLayout>
	);
};

export default EventsPage;
