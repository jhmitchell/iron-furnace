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
  const { loginUser, user } = useAuth();
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
            {loginError && !isSubmitting && <div className="login-error">{loginError}</div>}
            <Submit text="Sign in" color="orange" size="small" disabled={isSubmitting} />
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default LoginForm;
