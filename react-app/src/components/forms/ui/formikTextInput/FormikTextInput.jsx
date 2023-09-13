import React from "react";
import { useField, ErrorMessage } from "formik";
import "./FormikTextInput.css";

const FormikTextInput = ({ label, ...props }) => {
  // Use Formik's useField hook to manage the form state
  const [field] = useField(props);

  return (
    <div className="formik-text-input">
      <label htmlFor={props.id || props.name}>{label}</label>
      <input {...field} {...props} />

      {/* Show an error message if validation fails */}
      <div className="error-container">
        <ErrorMessage name={field.name} component="div" className="error" />
      </div>
    </div>
  );
};

export default FormikTextInput;
