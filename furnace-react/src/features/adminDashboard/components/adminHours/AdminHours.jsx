import React, { useState } from 'react';
import { useSetHours } from '/src/features/hours';
import styles from './AdminHours.module.css';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AdminHours = () => {
  const { handleSetHours, loading, message } = useSetHours();
  const [hours, setHours] = useState({});

  const handleInputChange = (day, type) => (event) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [type]: event.target.value }
    }));
  };

  const handleSubmit = async (day) => {
    const dayHours = hours[day];
    if (dayHours) {
      await handleSetHours(day, dayHours.start, dayHours.end);
    }
  };

  return (
    <div className={styles.adminHours}>
      <h1>Set Operating Hours</h1>
      {daysOfWeek.map(day => (
        <div key={day} className={styles.dayRow}>
          <label>{day}</label>
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
          <button onClick={() => handleSubmit(day)} disabled={loading}>Set</button>
        </div>
      ))}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
};

export default AdminHours;
