import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import TextInput from '../ui/formikTextInput/FormikTextInput';
import Submit from '../ui/formikSubmit/FormikSubmit';
import { useAuth } from '/src/features/authentication';
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

const LoginForm = () => {
  const { loginUser, user, isProcessing } = useAuth(); // Include isProcessing from useAuth
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = async (credentials, { setSubmitting }) => {
    const loggedIn = await loginUser(credentials);
    if (!loggedIn) {
      setLoginError('Invalid username or password');
    }
    setSubmitting(false);
  };

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
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

            {/* Disable submit button if isProcessing is true */}
            <Submit text="Sign in" color="orange" size="small" disabled={isSubmitting || isProcessing} />

            {loginError && !isSubmitting && !isProcessing && <div className="login-error">{loginError}</div>}
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default LoginForm;
