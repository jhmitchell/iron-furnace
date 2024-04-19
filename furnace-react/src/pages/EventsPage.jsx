import React from 'react';
import { EventSchedule } from '/src/features/events';
import MainLayout from '/src/layouts/MainLayout';
import styles from './EventsPage.module.css';

const EventsPage = () => {
	return (
		<MainLayout>
			<EventSchedule />
		</MainLayout>
	);
};

export default EventsPage;
