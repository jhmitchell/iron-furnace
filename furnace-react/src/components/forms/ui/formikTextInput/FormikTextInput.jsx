import React, { useState } from "react";
import { useField, ErrorMessage } from "formik";
import "./FormikTextInput.css";

const FormikTextInput = ({ label, ...props }) => {
  const [field] = useField(props);
  const [isFocused, setFocused] = useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  // Add a unicode symbol to the label based on its type.
  const getUnicodeSymbol = (label) => {
    if (label === "Username") return "👤 ";  // You can replace this with any Unicode symbol you'd like.
    if (label === "Password") return "🔒 ";  // You can replace this with any Unicode symbol you'd like.
    return "";
  };

  const symbol = getUnicodeSymbol(label);

  return (
    <div className="formik-text-input">
      <input 
        {...field} 
        {...props} 
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused || field.value ? "" : symbol + label}
        className={isFocused || field.value ? "active" : ""}
      />

      {/* Show an error message if validation fails */}
      <div className="error-container">
        <ErrorMessage name={field.name} component="div" className="error" />
      </div>
    </div>
  );
};

export default FormikTextInput;
