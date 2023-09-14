import React from 'react';
import { Formik, Form } from 'formik';
import TextInput from '../ui/formikTextInput/FormikTextInput'
import Submit from '../ui/formikSubmit/FormikSubmit'
import './LoginForm.css';

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
        <div className="login-form">
          <h1>Sign in</h1>
          <Form>
            <div>
              <TextInput 
                id="username" 
                name="username" 
                type="text" 
                label="Username" 
              />
            </div>

            <div>
              <TextInput 
                id="password" 
                name="password" 
                type="password" 
                label="Password" 
              />
            </div>

            <Submit text="Sign in" color="orange" size="small" />
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default LoginForm;
