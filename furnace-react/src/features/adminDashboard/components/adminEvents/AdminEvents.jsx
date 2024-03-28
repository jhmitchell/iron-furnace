import React, { useEffect } from 'react';
import { getEvents } from '/src/features/events';
import styles from './AdminEvents.module.css';

const AdminEvents = () => {
	const [events, setEvents] = React.useState([]);

	useEffect(() => {
		getEvents()
			.then((data) => {
				setEvents(data);
			})
			.catch((error) => {
				console.error(error);
			});
		
			console.log('events', events);
	}, []);

	return (
		<div className={styles.eventsCard}>
			Events
		</div>
	)
}

export default AdminEvents
