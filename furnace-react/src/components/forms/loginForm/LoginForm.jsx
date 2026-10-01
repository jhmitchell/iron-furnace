import { useEffect, useRef, useState } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
import { MdErrorOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import TextInput from '../ui/formikTextInput/FormikTextInput';
import Submit from '../ui/formikSubmit/FormikSubmit';
import { useAuth } from '/src/features/authentication';
import styles from './LoginForm.module.css';

const FIELD_ORDER = ['username', 'password'];

const validate = (values) => {
  const errors = {};
  if (!values.username.trim()) {
    errors.username = 'Enter your username.';
  }
  // Passwords are never trimmed: spaces may be part of them
  if (!values.password) {
    errors.password = 'Enter your password.';
  }
  return errors;
};

const minutes = (seconds) => Math.max(1, Math.ceil(seconds / 60));

const errorMessage = ({ error, retryAfter }) => {
  switch (error) {
    case 'invalid':
      return 'Incorrect username or password.';
    case 'disabled':
      return 'This account has been disabled. Please contact a site administrator.';
    case 'rate_limited': {
      if (!retryAfter) return 'Too many sign-in attempts. Please wait a few minutes and try again.';
      const wait = minutes(retryAfter);
      return `Too many sign-in attempts. Please wait ${wait} minute${wait === 1 ? '' : 's'} and try again.`;
    }
    case 'network':
      return "Can't reach the server. Check your internet connection and try again.";
    default:
      return 'Something went wrong on our end. Please try again in a moment.';
  }
};

/** After a submit attempt with missing fields, move focus to the first one. */
const FocusFirstInvalidField = ({ fieldRefs }) => {
  const { submitCount, isSubmitting, isValidating, errors } = useFormikContext();
  const handledSubmit = useRef(0);

  useEffect(() => {
    if (submitCount === handledSubmit.current || isSubmitting || isValidating) return;
    handledSubmit.current = submitCount;
    const first = FIELD_ORDER.find((name) => errors[name]);
    if (first) fieldRefs[first].current?.focus();
  }, [submitCount, isSubmitting, isValidating, errors, fieldRefs]);

  return null;
};

const LoginForm = () => {
  const { loginUser } = useAuth();
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const fieldRefs = useRef({ username: usernameRef, password: passwordRef }).current;
  // The sign-in request in flight, if any (guards against double submission)
  const inFlight = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const signIn = async (values, setSubmitting) => {
    setFormError('');

    const result = await loginUser({
      username: values.username.trim(),
      password: values.password,
    });

    if (result.ok) {
      // Signed in: the login page redirects, which unmounts this form.
      return;
    }

    setSubmitting(false);
    setFormError(errorMessage(result));
    if (result.error === 'invalid') {
      passwordRef.current?.focus();
      passwordRef.current?.select();
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // A second submit while one is in flight just waits for the first one.
    if (!inFlight.current) {
      inFlight.current = signIn(values, setSubmitting).finally(() => {
        inFlight.current = null;
      });
    }
    return inFlight.current;
  };

  const updateCapsLock = (event) => {
    if (typeof event.getModifierState === 'function') {
      setCapsLockOn(event.getModifierState('CapsLock'));
    }
  };

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validate={validate}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, submitCount }) => (
        <Form className={styles.form} noValidate aria-describedby="login-form-error">
          <FocusFirstInvalidField fieldRefs={fieldRefs} />

          {/* Always rendered, so screen readers announce a message when it appears */}
          <div id="login-form-error" role="alert" aria-atomic="true">
            {formError && (
              <p className={styles.alert}>
                <MdErrorOutline className={styles.alertIcon} aria-hidden="true" />
                <span>{formError}</span>
              </p>
            )}
          </div>

          <TextInput
            name="username"
            label="Username"
            type="text"
            inputRef={usernameRef}
            showError={submitCount > 0}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />

          <TextInput
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            inputRef={passwordRef}
            showError={submitCount > 0}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-describedby={capsLockOn ? 'password-capslock' : undefined}
            onKeyDown={updateCapsLock}
            onKeyUp={updateCapsLock}
            trailing={
              <button
                type="button"
                className={styles.reveal}
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label="Show password"
                aria-pressed={showPassword}
                aria-controls="password"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <MdVisibilityOff aria-hidden="true" />
                  : <MdVisibility aria-hidden="true" />}
              </button>
            }
          >
            <p id="password-capslock" className={styles.hint} aria-live="polite">
              {capsLockOn ? 'Caps Lock is on.' : ''}
            </p>
          </TextInput>

          <Submit text="Sign in" busyText="Signing in…" className={styles.submit} />

          <p className={styles.srOnly} aria-live="polite">
            {isSubmitting ? 'Signing in…' : ''}
          </p>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
