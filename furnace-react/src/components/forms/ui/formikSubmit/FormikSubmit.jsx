/* eslint-disable react/prop-types -- this project doesn't use PropTypes */
import { useFormikContext } from 'formik';
import styles from './FormikSubmit.module.css';

/**
 * The submit button of a Formik form: a real type="submit" button, so pressing Enter in
 * any field submits the form. While the form is submitting it shows `busyText` with a
 * spinner and ignores further clicks. It uses aria-disabled rather than `disabled` so a
 * keyboard user's focus stays on the button.
 */
const FormikSubmit = ({ text, busyText = text, className = '' }) => {
  const { isSubmitting } = useFormikContext();

  const handleClick = (event) => {
    if (isSubmitting) event.preventDefault();
  };

  return (
    <button
      type="submit"
      className={`${styles.submit} ${className}`.trim()}
      aria-disabled={isSubmitting || undefined}
      onClick={handleClick}
    >
      {isSubmitting && <span className={styles.spinner} aria-hidden="true" />}
      <span>{isSubmitting ? busyText : text}</span>
    </button>
  );
};

export default FormikSubmit;
