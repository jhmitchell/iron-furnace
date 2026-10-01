import { useField } from "formik";
import styles from "./FormikTextInput.module.css";

/**
 * A labelled text input bound to a Formik field.
 *
 * @param {string} name - Formik field name (also the default id)
 * @param {string} label - Visible label text
 * @param {boolean} showError - Whether to show the field's validation error now
 * @param {React.ReactNode} trailing - Optional control shown inside the input's right edge
 *   (e.g. a show/hide password button)
 * @param {React.ReactNode} children - Optional extra content under the input (e.g. a hint);
 *   give it an id and pass that id in aria-describedby
 * @param {React.Ref} inputRef - Ref to the <input>
 * Any other props (type, autoComplete, aria-describedby, ...) go to the <input>.
 */
const FormikTextInput = ({
  name,
  id = name,
  label,
  showError = true,
  trailing = null,
  children = null,
  inputRef,
  ...inputProps
}) => {
  const [field, meta] = useField(name);
  const hasError = Boolean(showError && meta.error);
  const errorId = `${id}-error`;
  const describedBy = [hasError ? errorId : null, inputProps["aria-describedby"]]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${trailing ? styles.hasTrailing : ""}`}>
        <input
          {...field}
          {...inputProps}
          id={id}
          ref={inputRef}
          className={`${styles.input} ${hasError ? styles.invalid : ""}`}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        />
        {trailing}
      </div>
      {hasError && (
        <p id={errorId} className={styles.error}>
          {meta.error}
        </p>
      )}
      {children}
    </div>
  );
};

export default FormikTextInput;
