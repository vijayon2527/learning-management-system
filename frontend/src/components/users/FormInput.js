import React from 'react';
import { CFormInput, CFormFeedback } from '@coreui/react';

const FormInput = ({ value, onChange, label, invalid, feedback }) => (
  <div className="mt-2">
    <label>{label}</label>
    <CFormInput type="text" value={value} onChange={onChange} invalid={invalid} />
    {invalid && <CFormFeedback invalid>{feedback}</CFormFeedback>}
  </div>
);

export default FormInput;