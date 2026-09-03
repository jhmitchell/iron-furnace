import React, { useEffect, useState } from 'react';
import { getAllEvents, deleteEvent } from '/src/features/events';
import EventEntry from '../eventEntry/EventEntry';
import EventCreationForm from '../eventCreationForm/EventCreationForm';
import { AdminPage, AdminCard, StatusMessage, EmptyState, ui } from '../ui';
import { eventStart } from '../../utils/dates';
import styles from './AdminEvents.module.css';

const byDate = (a, b) => new Date(eventStart(a)) - new Date(eventStart(b));

const AdminEvents = () => {
	const [events, setEvents] = useState([]);
	const [status, setStatus] = useState(null);

	const fetchAllEvents = async () => {
		try {
			const list = await getAllEvents();
			setEvents([...list].sort(byDate));
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to load events.' });
		}
	};

	useEffect(() => {
		fetchAllEvents();
	}, []);

	const removeEvent = async (event) => {
		if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
		setStatus(null);
		try {
			await deleteEvent(event.id);
			await fetchAllEvents();
			setStatus({ type: 'success', text: 'Event deleted.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to delete the event.' });
		}
	};

	return (
		<AdminPage
			title="Events"
			description="Events appear on the events page and in the upcoming events section of the home page. Past events are removed automatically overnight."
		>
			<div className={styles.layout}>
				<AdminCard
					title="Create an event"
					description="All fields are required. The preview shows the event card as visitors will see it."
				>
					<EventCreationForm onCreated={fetchAllEvents} />
				</AdminCard>

				<AdminCard title="Scheduled events" aside={<span className={ui.countPill}>{events.length}</span>}>
					{events.length === 0 ? (
						<EmptyState>No events scheduled. Create one using the form.</EmptyState>
					) : (
						<div className={ui.list}>
							{events.map((event) => (
								<EventEntry key={event.id} event={event} onDelete={removeEvent} onSaved={fetchAllEvents} />
							))}
						</div>
					)}
					<StatusMessage status={status} className={ui.spaceTop} />
				</AdminCard>
			</div>
		</AdminPage>
	);
};

export default AdminEvents;
