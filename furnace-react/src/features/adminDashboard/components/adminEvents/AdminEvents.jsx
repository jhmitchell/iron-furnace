import React, { useEffect } from 'react';
import { getAllEvents, getUpcomingEvents } from '/src/features/events';
import styles from './AdminEvents.module.css';

const AdminEvents = () => {
	const [events, setEvents] = React.useState([]);

	const fetchAllEvents = async () => {
		try {
			const events = await getAllEvents();
			setEvents(events);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchAllEvents();
	}, []);

	return (
		<div className={styles.eventsCard}>
			<h2>Events</h2>
			<ul>
				{events.map((event) => (
					<li key={event.id}>
						{event.title} - {event.description}
					</li>
				))}
			</ul>
		</div>
	)
}

export default AdminEvents
