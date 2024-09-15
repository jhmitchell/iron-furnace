import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { createEvent } from '/src/features/events';
import * as Yup from 'yup';
import { EventCard } from '../../../events';
import styles from './EventCreationForm.module.css';

const EventCreationForm = () => {
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

  const [imageURL, setImageURL] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const { title, description, date, time, image } = values;

    const event_start = `${date}T${time}:00`;

    // Placeholder values for the missing form fields
    const category = 'Default Category';
    const link_text = 'Learn More';
    const link_url = 'test';

    setSubmissionStatus('submitting');

    try {
      // Create the event object with all required and optional fields
      const event = {
        title,
        description,
        event_start,
        category,
        link_text,
        link_url,
      };

      // Pass the event object and the image file to the createEvent service
      await createEvent(event, image);

      // Handle success, clear form, or redirect as needed
      resetForm();
      setImageURL('');
      setSubmissionStatus('success');
    } catch (error) {
      console.error('Error creating event:', error);
      setSubmissionStatus('error');
      // Handle error (e.g., show error message)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ setFieldValue, isSubmitting, values }) => {
        // Update the imageURL whenever the image value changes
        useEffect(() => {
          if (values.image) {
            const fileURL = URL.createObjectURL(values.image);
            setImageURL(fileURL);

            // Cleanup function to revoke the created URL
            return () => {
              URL.revokeObjectURL(fileURL);
            };
          } else {
            setImageURL('');
          }
        }, [values.image]);

        return (
          <Form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title
              </label>
              <Field type="text" id="title" name="title" className={styles.textField} />
              <ErrorMessage name="title" component="div" className={styles.error} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <Field as="textarea" id="description" name="description" className={styles.textArea} />
              <ErrorMessage name="description" component="div" className={styles.error} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.label}>
                Date
              </label>
              <Field type="date" id="date" name="date" className={styles.textField} />
              <ErrorMessage name="date" component="div" className={styles.error} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time" className={styles.label}>
                Time
              </label>
              <Field type="time" id="time" name="time" className={styles.textField} />
              <ErrorMessage name="time" component="div" className={styles.error} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image" className={styles.label}>
                Event Photo
              </label>
              <input
                id="image"
                name="image"
                type="file"
                onChange={(event) => {
                  setFieldValue('image', event.currentTarget.files[0]);
                }}
                accept="image/*"
                className={styles.fileInput}
              />
              <ErrorMessage name="image" component="div" className={styles.error} />
            </div>

            <div className={styles.previewContainer}>
              <h3 className={styles.previewTitle}>Live Preview</h3>
              <div className={styles.preview}>
                <EventCard
                  event={{
                    ...values,
                    image: imageURL,
                    event_start: `${values.date}T${values.time}:00`,
                  }}
                />
              </div>
            </div>

            {submissionStatus === 'success' && (
              <div className={styles.successMessage}>Event created successfully!</div>
            )}

            {submissionStatus === 'error' && (
              <div className={styles.errorMessage}>Error creating event. Please try again.</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || submissionStatus === 'submitting'}
              className={styles.submitButton}
            >
              {submissionStatus === 'submitting' ? 'Creating Event...' : 'Create Event'}
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default EventCreationForm;
