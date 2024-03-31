import React, { useEffect } from 'react';
import { getAllEvents, deleteEvent } from '/src/features/events';
import EventEntry from '../eventEntry/EventEntry';
import EventCreationForm from '../eventCreationForm/EventCreationForm';
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

	const removeEvent = async (id) => {
		try {
			await deleteEvent(id);
			fetchAllEvents();
		} catch (error) {
			console.error("Failed to remove event:", error);
			alert("Failed to remove the event. Please check the console for more details.");
		}
	};

	useEffect(() => {
		fetchAllEvents();
	}, []);

	return (
		<div className={styles.eventGrid}>
			<div className={styles.eventCard}>
				<h2>Create Event</h2>
				<EventCreationForm />
			</div>
			<div className={styles.eventList}>
				<h2>Manage Events</h2>
				{events.map((event, index) => (
					// Could Generalize EventEntry into DatabaseListEntry or something similar
					<EventEntry key={index} event={event} onDelete={(id) => removeEvent(id)} />
				))}
			</div>
		</div>
	)
}

export default AdminEvents
