import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const validate = values => {
  const errors = {};
  if (!values.username) {
    errors.username = 'Required';
  }
  
  if (!values.password) {
    errors.password = 'Required';
  }
  
  return errors;
};

const LoginForm = ({ onSubmit }) => {
  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validate={validate}
      onSubmit={(credentials, { setSubmitting }) => {
        onSubmit(credentials);
        setSubmitting(false);
      }}
    >
      {() => (
        <Form>
          <div>
            <label htmlFor="username">Username</label>
            <Field type="text" id="username" name="username" />
            <ErrorMessage name="username" component="div" />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Field type="password" id="password" name="password" />
            <ErrorMessage name="password" component="div" />
          </div>

          <button type="submit">Log In</button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
