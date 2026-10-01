import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createEvent, EventCard } from '/src/features/events';
import { StatusMessage, ui } from '../ui';
import styles from './EventCreationForm.module.css';

const initialValues = {
  title: '',
  description: '',
  date: '',
  time: '',
  image: null,
};

const validationSchema = Yup.object({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  date: Yup.date().required('Required'),
  time: Yup.string().required('Required'),
  image: Yup.mixed().required('An image file is required'),
});

/**
 * Create-event form with a live preview of the public event card.
 * Calls `onCreated` after a successful save so the parent can refresh its list.
 */
const EventCreationForm = ({ onCreated }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [status, setStatus] = useState(null);

  // Build (and later revoke) an object URL for the chosen photo
  useEffect(() => {
    if (!imageFile) {
      setImageURL('');
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImageURL(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const { title, description, date, time, image } = values;

    // Placeholder values for fields the form does not collect yet
    const event = {
      title,
      description,
      event_start: `${date}T${time}:00`,
      category: 'Default Category',
      link_text: '',
      link_url: 'test',
    };

    setStatus(null);
    try {
      await createEvent(event, image);
      resetForm();
      setImageFile(null);
      setFileInputKey((key) => key + 1);
      setStatus({ type: 'success', text: 'Event created.' });
      if (onCreated) onCreated();
    } catch (error) {
      console.error('Error creating event:', error);
      setStatus({ type: 'error', text: 'Failed to create the event. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ setFieldValue, isSubmitting, values }) => (
        <Form className={ui.form}>
          <div className={ui.field}>
            <label htmlFor="title" className={ui.label}>Title</label>
            <Field type="text" id="title" name="title" className={ui.input} placeholder="e.g. Blacksmith Demonstration Day" />
            <ErrorMessage name="title" component="div" className={ui.fieldError} />
          </div>

          <div className={ui.field}>
            <label htmlFor="description" className={ui.label}>Description</label>
            <Field as="textarea" id="description" name="description" className={ui.textarea} rows={4} />
            <ErrorMessage name="description" component="div" className={ui.fieldError} />
          </div>

          <div className={ui.row}>
            <div className={ui.field}>
              <label htmlFor="date" className={ui.label}>Date</label>
              <Field type="date" id="date" name="date" className={ui.input} />
              <ErrorMessage name="date" component="div" className={ui.fieldError} />
            </div>
            <div className={ui.field}>
              <label htmlFor="time" className={ui.label}>Time</label>
              <Field type="time" id="time" name="time" className={ui.input} />
              <ErrorMessage name="time" component="div" className={ui.fieldError} />
            </div>
          </div>

          <div className={ui.field}>
            <label htmlFor="image" className={ui.label}>Event photo</label>
            <input
              key={fileInputKey}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className={ui.fileInput}
              onChange={(event) => {
                const file = event.currentTarget.files[0] || null;
                setFieldValue('image', file);
                setImageFile(file);
              }}
            />
            <ErrorMessage name="image" component="div" className={ui.fieldError} />
          </div>

          <div>
            <div className={ui.sectionLabel}>Preview</div>
            <div className={styles.preview}>
              <EventCard
                event={{
                  title: values.title || 'Event title',
                  description: values.description || 'The event description will appear here.',
                  image: imageURL || undefined,
                  start_date: values.date && values.time ? `${values.date}T${values.time}:00` : undefined,
                }}
                imageHeight="180px"
              />
            </div>
          </div>

          <div className={ui.actions}>
            <button type="submit" className={`${ui.button} ${ui.buttonPrimary}`} disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create event'}
            </button>
          </div>

          <StatusMessage status={status} />
        </Form>
      )}
    </Formik>
  );
};

export default EventCreationForm;
