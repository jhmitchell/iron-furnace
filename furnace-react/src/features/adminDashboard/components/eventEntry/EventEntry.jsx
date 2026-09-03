import React, { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { editEvent } from '/src/features/events';
import { DateBadge, StatusMessage, ui } from '../ui';
import { eventStart, formatEventDateTime } from '../../utils/dates';
import styles from './EventEntry.module.css';

const toDateInput = (iso) => (iso ? iso.split('T')[0] : '');
const toTimeInput = (iso) => (iso && iso.includes('T') ? iso.split('T')[1].slice(0, 5) : '');

const initialForm = (event) => ({
  title: event.title || '',
  description: event.description || '',
  date: toDateInput(eventStart(event)),
  time: toTimeInput(eventStart(event)),
  linkText: event.link_text || '',
});

/**
 * One scheduled event: a summary row with edit/delete actions, and an
 * inline edit form that expands beneath it.
 */
const EventEntry = ({ event, onDelete, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => initialForm(event));
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const startEdit = () => {
    setForm(initialForm(event));
    setImageFile(null);
    setPdfFile(null);
    setStatus(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setStatus(null);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setStatus({ type: 'error', text: 'Title is required.' });
      return;
    }
    if (!form.date || !form.time) {
      setStatus({ type: 'error', text: 'Enter both a date and a time.' });
      return;
    }

    const updated = {
      title: form.title.trim(),
      description: form.description.trim(),
      event_start: `${form.date}T${form.time}:00`,
    };
    if (form.linkText.trim()) updated.link_text = form.linkText.trim();

    setSaving(true);
    setStatus(null);
    try {
      await editEvent(event.id, updated, imageFile, pdfFile);
      setIsEditing(false);
      if (onSaved) onSaved();
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to save the event.' });
    } finally {
      setSaving(false);
    }
  };

  const eventDate = new Date(eventStart(event));
  const isPast = eventDate < new Date();
  const fieldId = (name) => `event-${event.id}-${name}`;

  return (
    <div className={`${ui.listItem} ${styles.entry} ${isEditing ? styles.editing : ''} ${isPast && !isEditing ? ui.past : ''}`}>
      <div className={styles.summary}>
        <DateBadge date={eventDate} />
        <div className={ui.listItemMain}>
          <div className={styles.title}>{event.title || 'Untitled event'}</div>
          <div className={ui.listItemMeta}>
            {formatEventDateTime(eventStart(event))}
            {isPast && ' · Past'}
          </div>
        </div>
        <div className={ui.listItemActions}>
          <button
            type="button"
            className={ui.iconButton}
            onClick={isEditing ? cancelEdit : startEdit}
            title={isEditing ? 'Cancel editing' : 'Edit event'}
          >
            <MdEdit />
          </button>
          <button
            type="button"
            className={`${ui.iconButton} ${ui.iconButtonDanger}`}
            onClick={() => onDelete(event)}
            title="Delete event"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {isEditing && (
        <form className={`${ui.form} ${styles.editForm}`} onSubmit={handleSubmit}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor={fieldId('title')}>Title</label>
            <input
              id={fieldId('title')}
              type="text"
              className={ui.input}
              value={form.title}
              onChange={handleChange('title')}
              disabled={saving}
            />
          </div>

          <div className={ui.field}>
            <label className={ui.label} htmlFor={fieldId('description')}>Description</label>
            <textarea
              id={fieldId('description')}
              className={ui.textarea}
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
              disabled={saving}
            />
          </div>

          <div className={ui.row}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor={fieldId('date')}>Date</label>
              <input
                id={fieldId('date')}
                type="date"
                className={ui.input}
                value={form.date}
                onChange={handleChange('date')}
                disabled={saving}
              />
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor={fieldId('time')}>Time</label>
              <input
                id={fieldId('time')}
                type="time"
                className={ui.input}
                value={form.time}
                onChange={handleChange('time')}
                disabled={saving}
              />
            </div>
          </div>

          <div className={ui.row}>
            <div className={ui.field}>
              <label className={ui.label} htmlFor={fieldId('image')}>Replace photo (optional)</label>
              <input
                id={fieldId('image')}
                type="file"
                accept="image/*"
                className={ui.fileInput}
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                disabled={saving}
              />
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor={fieldId('pdf')}>Attach PDF (optional)</label>
              <input
                id={fieldId('pdf')}
                type="file"
                accept="application/pdf"
                className={ui.fileInput}
                onChange={(e) => setPdfFile(e.target.files[0] || null)}
                disabled={saving}
              />
            </div>
          </div>

          <div className={ui.field}>
            <label className={ui.label} htmlFor={fieldId('link')}>Link text (optional)</label>
            <input
              id={fieldId('link')}
              type="text"
              className={ui.input}
              value={form.linkText}
              onChange={handleChange('linkText')}
              placeholder="e.g. View the flyer"
              disabled={saving}
            />
            <span className={ui.hint}>Shown as the call to action on the event card.</span>
          </div>

          <div className={ui.actions}>
            <button type="submit" className={`${ui.button} ${ui.buttonPrimary}`} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className={`${ui.button} ${ui.buttonSecondary}`} onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          </div>

          <StatusMessage status={status} />
        </form>
      )}
    </div>
  );
};

export default EventEntry;
