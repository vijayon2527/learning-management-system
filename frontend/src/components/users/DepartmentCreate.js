import React, { useState } from 'react';
import {
  CForm,
  CFormInput,
  CButton,
  CInputGroup,
  CSpinner,
  CFormFeedback,
  CFormTextarea,
  CContainer,
  CFormLabel,
} from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const notify = (message) => toast(message);

const DepartmentCreate = ({ onDepartmentCreated, onClose }) => {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentDescription: '',
  });

  const [formErrors, setFormErrors] = useState({
    departmentName: '',
    departmentDescription: '',
  });

  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setFormErrors((prevState) => ({
      ...prevState,
      [name]: '', // Clear the specific error on user input
    }));
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Reset errors
    setFormErrors({
      departmentName: '',
      departmentDescription: '',
    });

    // Client-side validation
    let isValid = true;
    const errors = { ...formErrors };

    if (!formData.departmentName.trim()) {
      errors.departmentName = 'Department name is required.';
      isValid = false;
    }

    setFormErrors(errors);

    if (!isValid) {
      setIsFormValidated(false);
      return;
    }

    setIsFormValidated(true);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('api/users/create-department/', {
        name: formData.departmentName,
        description: formData.departmentDescription,
      });
      notify('Department created successfully!');
      onDepartmentCreated(response.data); // Notify parent component
      onClose(); // Close modal or dialog
      setFormData({
        departmentName: '',
        departmentDescription: '',
      });
    } catch (error) {
      const errorData = error.response?.data || {};
      const errors = { ...formErrors };

      if (errorData.name) {
        errors.departmentName = errorData.name[0]; // Server-side error
        notify(errorData.name[0]);
      }

      setFormErrors(errors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CContainer>
      <CForm onSubmit={handleFormSubmit} noValidate>
        <div className="mb-3">
              <CFormLabel>
                Department Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
              </CFormLabel>
          <CInputGroup>
            <CFormInput
              id="departmentName"
              type="text"
              placeholder="Enter department name"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleInputChange}
              invalid={!!formErrors.departmentName}
              valid={
                !formErrors.departmentName &&
                isFormValidated &&
                !!formData.departmentName.trim()
              }
              required
            />
            <CFormFeedback invalid>{formErrors.departmentName}</CFormFeedback>
            <CFormFeedback valid>Looks good!</CFormFeedback>
          </CInputGroup>
        </div>

        <div className="mb-3">
          <label htmlFor="departmentDescription" className="form-label">
            Department Description
          </label>
          <CFormTextarea
            id="departmentDescription"
            rows={3}
            placeholder="Enter department description"
            name="departmentDescription"
            value={formData.departmentDescription}
            onChange={handleInputChange}
          />
        </div>

        <CButton
          type="submit"
          color="info"
          className="w-100"
          disabled={isLoading}
        >
          {isLoading ? <CSpinner size="sm" /> : 'Create Department'}
        </CButton>
      </CForm>
    </CContainer>
  );
};

export default DepartmentCreate;
