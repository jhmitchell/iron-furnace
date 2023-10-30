import React from 'react';
import { useFormikContext } from 'formik';
import { Button } from '/src/components/ui';

// pass all props (props..)
const FormikSubmit = (props) => {
  // Get Formik's submitForm function
  const { submitForm } = useFormikContext();

  return (
    <Button {...props} onClick={submitForm} />
  );
};

export default FormikSubmit;
