import React, { useEffect, useState } from 'react';
import { useSetHours, getAllHours } from '/src/features/hours';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import styles from './HoursCard.module.css';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HoursCard = () => {
  const { handleSetHours, loading, message } = useSetHours();
  const [hours, setHours] = useState(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { start: '', end: '' }}), {}));
  const [editMode, setEditMode] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const hourInt = parseInt(hour, 10);
    const ampm = hourInt >= 12 ? 'PM' : 'AM';
    let hour12 = hourInt % 12;
    if (hour12 === 0) hour12 = 12; // Handle midnight and noon correctly
    return `${hour12.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };
  
  const refreshHours = async () => {
    try {
      const { hours: currentHours } = await getAllHours();
      const hoursDict = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { start: '', end: '' }}), {});
      currentHours.forEach(({ day_of_week, open_time, close_time }) => {
        hoursDict[day_of_week] = { 
          start: formatTime(open_time), 
          end: formatTime(close_time) 
        };
      });
      setHours(hoursDict);
      setStatusMessage('View or modify the hours above.');
    } catch (error) {
      setStatusMessage('Failed to fetch hours.');
    }
  };  

  useEffect(() => {
    refreshHours();
  }, []);

  const handleInputChange = (day, type) => (event) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [type]: event.target.value }
    }));
  };

  const handleSubmit = async (day) => {
    const dayHours = hours[day];
    if (dayHours.start && dayHours.end) {
      try {
        console.log(`Setting hours for ${day}:`, dayHours.start, dayHours.end)
        await handleSetHours(day, dayHours.start, dayHours.end);
        await refreshHours();
        setEditMode(null);
        setStatusMessage('Hours updated successfully.');
      } catch (error) {
        setStatusMessage('Failed to update hours.');
      }
    }
  };

  const handleDelete = async (day) => {
    try {
      await handleSetHours(day, null, null);
      await refreshHours();
      setStatusMessage('Hours deleted successfully.');
    } catch (error) {
      console.error(`Failed to delete hours for ${day}:`, error);
      setStatusMessage('Failed to delete hours.');
    }
  };

  return (
    <div className={styles.adminHours}>
      <h1>Operating Hours</h1>
      {daysOfWeek.map(day => (
        <div key={day} className={styles.dayRow}>
          <label>{day}</label>
          {editMode === day ? (
            <>
              <input
                type="time"
                value={hours[day]?.start || ''}
                onChange={handleInputChange(day, 'start')}
                disabled={loading}
              />
              <input
                type="time"
                value={hours[day]?.end || ''}
                onChange={handleInputChange(day, 'end')}
                disabled={loading}
              />
              <button onClick={() => handleSubmit(day)} disabled={loading}>Save</button>
            </>
          ) : (
            <div className={styles.dayInfo}>
              <span className={styles.hours}>{hours[day] && hours[day].start ? `${hours[day].start} - ${hours[day].end}` : 'Closed'}</span>
              <FaPencilAlt onClick={() => setEditMode(day)} />
              <FaTrashAlt onClick={() => handleDelete(day)} />
            </div>
          )}
        </div>
      ))}
      <div className={styles.message}>{statusMessage || message}</div>
    </div>
  );
};

export default HoursCard;
