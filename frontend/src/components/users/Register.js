import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
} from "@coreui/react";
import { toast } from 'react-toastify';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

   const notify = (msg, type = 'success') => {
      type === 'error' ? toast.error(msg) : toast.success(msg);
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name) newErrors.first_name = "This field is required.";
    if (!formData.last_name) newErrors.last_name = "This field is required.";
    if (!formData.email) newErrors.email = "This field is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address.";
    if (!formData.password) newErrors.password = "This field is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters long.";
    if (formData.password !== formData.confirm_password)
      newErrors.confirm_password = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("api/users/register/", formData);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
      });
      setLoading(false);
      notify("Registration successful!");
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
      setLoading(false);
    }
  };

  const getFieldStatus = (field) =>
    errors[field] ? "is-invalid" : formData[field] ? "is-valid" : "";

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
        <CRow className="w-100 justify-content-center">
          <CCol xs={12} md={6} lg={5}>
            <CCard className="p-4 shadow" style={{ borderRadius: '1rem' }}>
              <CCardBody>
              <h2 className="text-center mb-4">Register</h2>
              <CForm onSubmit={handleSubmit} noValidate validated={validated}>
                <CFormLabel>
                  First Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className={`form-control-lg ${getFieldStatus("first_name")}`}
                />
                {errors.first_name && (
                  <div className="text-danger mb-2">{errors.first_name}</div>
                )}

                <CFormLabel>
                  Last Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className={`form-control-lg ${getFieldStatus("last_name")}`}
                />
                {errors.last_name && (
                  <div className="text-danger mb-2">{errors.last_name}</div>
                )}

                <CFormLabel>
                  Email <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`form-control-lg ${getFieldStatus("email")}`}
                />
                {errors.email && (
                  <div className="text-danger mb-2">{errors.email}</div>
                )}

                <CFormLabel>
                  Password <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={`form-control-lg ${getFieldStatus("password")}`}
                />
                {errors.password && (
                  <div className="text-danger mb-2">{errors.password}</div>
                )}
                
                <CFormLabel>
                  Confirm Password <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className={`form-control-lg ${getFieldStatus("confirm_password")}`}
                />
                {errors.confirm_password && (
                  <div className="text-danger mb-3">{errors.confirm_password}</div>
                )}

                {errors.general && (
                  <div className="text-danger text-center mb-3">
                    {errors.general}
                  </div>
                )}

                {/* ✅ Added margin-top to create space before the button */}
                <CButton
                  type="submit"
                  color="primary"
                  className="w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? <CSpinner size="sm" /> : "Register"}
                </CButton>

                {/* ✅ Added login redirect link */}
                <div className="text-center mt-3">
                  <span>Already have an account? </span>
                  <a href="/login" className="text-primary fw-bold">Login</a>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default RegistrationForm;