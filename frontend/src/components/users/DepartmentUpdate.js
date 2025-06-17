import React, { useState, useEffect } from 'react';
import {
  CForm,
  CFormInput,
  CButton,
  CFormFeedback,
  CFormTextarea,
  CContainer,
  CSpinner,
  CFormLabel,
} from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const notify = (message) => toast(message);

const DepartmentUpdate = ({ onDepartmentUpdated, departmentId, onClose }) => {
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

  useEffect(() => {
    if (departmentId) {
      const fetchDepartmentData = async () => {
        try {
          const response = await axiosInstance.get(`api/users/department-update/${departmentId}/`);
          setFormData({
            departmentName: response.data.name,
            departmentDescription: response.data.description,
          });
        } catch (err) {
          notify('Error fetching department data.');
        }
      };

      fetchDepartmentData();
    }
  }, [departmentId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setFormErrors((prevState) => ({
      ...prevState,
      [name]: '', // Clear specific error
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setFormErrors({
      departmentName: '',
      departmentDescription: '',
    });

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
      const response = await axiosInstance.put(`api/users/department-update/${departmentId}/`, {
        name: formData.departmentName,
        description: formData.departmentDescription,
      });
      notify('Department updated successfully!');
      if (onDepartmentUpdated) onDepartmentUpdated(response.data);
      if (onClose) onClose();
    } catch (err) {
      const errorData = err.response?.data || {};
      const errors = { ...formErrors };
      console.log(errorData);
      if (errorData.name) {
        errors.departmentName = errorData.name[0];
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

        <CButton type="submit" color="info" className="w-100" disabled={isLoading}>
          {isLoading ? <CSpinner size="sm" /> : 'Update Department'}
        </CButton>
      </CForm>
    </CContainer>
  );
};

export default DepartmentUpdate;
