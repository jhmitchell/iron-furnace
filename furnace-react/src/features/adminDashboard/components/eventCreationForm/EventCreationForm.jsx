import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { createEvent } from '/src/features/events';
import * as Yup from 'yup';

const EventCreationForm = () => {
    const initialValues = {
        title: '',
        description: '',
        date: '',
        image: null,
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Required'),
        description: Yup.string().required('Required'),
        date: Yup.date().required('Required'),
        time: Yup.string().required('Required'),
        image: Yup.mixed().required('An image file is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const {
            title,
            description,
            date,
            time,
            image,
        } = values;

        const event_start = `${date}T${time}:00`;

        // Placeholder values for the missing form fields
        const category = "Default Category";
        const link_text = "Learn More";
        const link_url = "test";

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
            const response = await createEvent(event, image);
            console.log('Event Created Successfully:', response);
            // Handle success, clear form, or redirect as needed
        } catch (error) {
            console.error('Error creating event:', error);
            // Handle error (e.g., show error message)
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ setFieldValue, isSubmitting }) => (
                <Form>
                    <div>
                        <label htmlFor="title">Title</label>
                        <Field type="text" id="title" name="title" />
                        <ErrorMessage name="title" component="div" />
                    </div>
                    <div>
                        <label htmlFor="description">Description</label>
                        <Field as="textarea" id="description" name="description" />
                        <ErrorMessage name="description" component="div" />
                    </div>
                    <div>
                        <label htmlFor="date">Date</label>
                        <Field type="date" id="date" name="date" />
                        <ErrorMessage name="date" component="div" />
                    </div>
                    <div>
                        <label htmlFor="time">Time</label>
                        <Field type="time" id="time" name="time" />
                        <ErrorMessage name="time" component="div" />
                    </div>

                    <div>
                        <label htmlFor="image">Event Photo</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            onChange={(event) => {
                                setFieldValue("image", event.currentTarget.files[0]);
                            }}
                            accept="image/*"
                        />
                        <ErrorMessage name="image" component="div" />
                    </div>
                    <button type="submit" disabled={isSubmitting}>
                        Create Event
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default EventCreationForm;
