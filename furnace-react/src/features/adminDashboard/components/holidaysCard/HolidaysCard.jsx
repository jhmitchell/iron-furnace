import React, { useEffect, useState } from 'react';
import { getHolidays, setHoliday } from '/src/features/hours';
import HolidayEntry from '../holidayEntry/HolidayEntry';
import { formatHolidayDate } from '../../utils/dates';
import { StatusMessage, EmptyState, ui } from '../ui';
import styles from './HolidaysCard.module.css';

/**
 * Holidays and one-off closures. Adding a date that already exists updates
 * its description; removing sends a blank description, which deletes it.
 */
const HolidaysCard = () => {
	const [holidays, setHolidays] = useState([]);
	const [date, setDate] = useState('');
	const [description, setDescription] = useState('');
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState(null);

	const refresh = async () => {
		try {
			const list = await getHolidays();
			setHolidays([...list].sort((a, b) => String(a.holiday_date).localeCompare(String(b.holiday_date))));
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to load holidays.' });
		}
	};

	useEffect(() => {
		refresh();
	}, []);

	const handleAdd = async (event) => {
		event.preventDefault();
		if (!date || !description.trim()) {
			setStatus({ type: 'error', text: 'Choose a date and enter a reason for the closure.' });
			return;
		}

		setBusy(true);
		setStatus(null);
		try {
			await setHoliday(date, description.trim());
			setDate('');
			setDescription('');
			await refresh();
			setStatus({ type: 'success', text: `Closure added for ${formatHolidayDate(date)}.` });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to add the closure.' });
		} finally {
			setBusy(false);
		}
	};

	const handleRemove = async (holiday) => {
		const label = `${holiday.description} on ${formatHolidayDate(holiday.holiday_date)}`;
		if (!window.confirm(`Remove "${label}"?`)) return;

		setBusy(true);
		setStatus(null);
		try {
			await setHoliday(holiday.holiday_date, null);
			await refresh();
			setStatus({ type: 'success', text: 'Closure removed.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to remove the closure.' });
		} finally {
			setBusy(false);
		}
	};

	return (
		<>
			<form onSubmit={handleAdd} className={styles.addForm}>
				<div className={`${ui.field} ${styles.dateField}`}>
					<label className={ui.label} htmlFor="holiday-date">Date</label>
					<input
						id="holiday-date"
						type="date"
						className={ui.input}
						value={date}
						onChange={(e) => setDate(e.target.value)}
						disabled={busy}
					/>
				</div>
				<div className={ui.field}>
					<label className={ui.label} htmlFor="holiday-description">Reason</label>
					<input
						id="holiday-description"
						type="text"
						className={ui.input}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="e.g. Christmas Day"
						disabled={busy}
					/>
				</div>
				<button type="submit" className={`${ui.button} ${ui.buttonPrimary} ${styles.addButton}`} disabled={busy}>
					Add
				</button>
			</form>

			{holidays.length === 0 ? (
				<EmptyState>No holidays or special closures scheduled.</EmptyState>
			) : (
				<div className={ui.list}>
					{holidays.map((holiday) => (
						<HolidayEntry
							key={holiday.holiday_date}
							holiday={holiday}
							onDelete={() => handleRemove(holiday)}
							disabled={busy}
						/>
					))}
				</div>
			)}

			<StatusMessage status={status} className={ui.spaceTop} />
		</>
	);
};

export default HolidaysCard;
