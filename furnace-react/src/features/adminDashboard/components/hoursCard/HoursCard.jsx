import React, { useEffect, useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { getAllHours, setHours } from '/src/features/hours';
import { StatusMessage, ui } from '../ui';
import styles from './HoursCard.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_DRAFT = { start: '', end: '' };

// "09:00:00" from the API -> "09:00" for <input type="time">
const toInputTime = (value) => (value ? value.slice(0, 5) : '');

// "09:00" -> "9:00 AM"
const formatTime = (value) => {
  if (!value) return '';
  const [hourString, minute] = value.split(':');
  const hour = parseInt(hourString, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
};

/**
 * Weekly operating hours editor. Each day is either open (with a start and
 * end time) or closed. Days without a saved entry are treated as closed.
 */
const HoursCard = () => {
  const [hours, setHoursState] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  const refresh = async () => {
    try {
      const { hours: current } = await getAllHours();
      const next = {};
      current.forEach(({ day_of_week, open_time, close_time }) => {
        next[day_of_week] = { start: toInputTime(open_time), end: toInputTime(close_time) };
      });
      setHoursState(next);
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to load hours.' });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const startEdit = (day) => {
    setEditingDay(day);
    setDraft(hours[day] || EMPTY_DRAFT);
    setStatus(null);
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setDraft(EMPTY_DRAFT);
  };

  const save = async (day) => {
    if (!draft.start || !draft.end) {
      setStatus({ type: 'error', text: 'Enter both an opening and a closing time.' });
      return;
    }
    if (draft.end <= draft.start) {
      setStatus({ type: 'error', text: 'Closing time must be after the opening time.' });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      await setHours(day, draft.start, draft.end);
      await refresh();
      cancelEdit();
      setStatus({ type: 'success', text: `${day} hours saved.` });
    } catch (error) {
      setStatus({ type: 'error', text: `Failed to save ${day} hours.` });
    } finally {
      setBusy(false);
    }
  };

  const markClosed = async (day) => {
    if (!window.confirm(`Mark ${day} as closed?`)) return;

    setBusy(true);
    setStatus(null);
    try {
      await setHours(day, null, null);
      await refresh();
      setStatus({ type: 'success', text: `${day} is now shown as closed.` });
    } catch (error) {
      setStatus({ type: 'error', text: `Failed to update ${day}.` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.dayList}>
        {DAYS.map((day) => {
          const dayHours = hours[day];
          const isEditing = editingDay === day;

          return (
            <div key={day} className={`${styles.dayRow} ${isEditing ? styles.dayRowEditing : ''}`}>
              <span className={styles.dayName}>{day}</span>

              {isEditing ? (
                <div className={styles.editControls}>
                  <input
                    type="time"
                    className={`${ui.input} ${ui.inputSmall} ${styles.timeInput}`}
                    value={draft.start}
                    onChange={(e) => setDraft((prev) => ({ ...prev, start: e.target.value }))}
                    aria-label={`${day} opening time`}
                    disabled={busy}
                    autoFocus
                  />
                  <span className={styles.to}>to</span>
                  <input
                    type="time"
                    className={`${ui.input} ${ui.inputSmall} ${styles.timeInput}`}
                    value={draft.end}
                    onChange={(e) => setDraft((prev) => ({ ...prev, end: e.target.value }))}
                    aria-label={`${day} closing time`}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonPrimary} ${ui.buttonSmall}`}
                    onClick={() => save(day)}
                    disabled={busy}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonSecondary} ${ui.buttonSmall}`}
                    onClick={cancelEdit}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className={dayHours ? styles.hoursText : styles.closedText}>
                    {dayHours ? `${formatTime(dayHours.start)} – ${formatTime(dayHours.end)}` : 'Closed'}
                  </span>
                  <div className={ui.listItemActions}>
                    <button
                      type="button"
                      className={ui.iconButton}
                      onClick={() => startEdit(day)}
                      title={dayHours ? `Edit ${day} hours` : `Set ${day} hours`}
                      disabled={busy}
                    >
                      <MdEdit />
                    </button>
                    {dayHours && (
                      <button
                        type="button"
                        className={`${ui.iconButton} ${ui.iconButtonDanger}`}
                        onClick={() => markClosed(day)}
                        title={`Mark ${day} as closed`}
                        disabled={busy}
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <StatusMessage status={status} className={ui.spaceTop} />
    </>
  );
};

export default HoursCard;
