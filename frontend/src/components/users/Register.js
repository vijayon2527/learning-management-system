import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  CButton,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel
} from "@coreui/react";
const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);


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
      setSuccessMessage("Registration successful!");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        department_id: "",
        role_id: "",
      });
      setRoles([]);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.non_field_errors) {
          setErrors({ email: error.response.data.non_field_errors[0] });
        } else {
          setErrors(error.response.data);
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again later.",
        });
      }
      setLoading(false);
    }
  };

  const getFieldStatus = (fieldName) => {
    return errors[fieldName] ? "is-invalid" : formData[fieldName] ? "is-valid" : "";
  };

  return (
    <CContainer>
      <CForm onSubmit={handleSubmit} noValidate validated={validated}>
          <CFormLabel>
            First Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="first_name"
            value={formData.first_name}
            placeholder="First Name"
            onChange={handleInputChange}
            required
            className={`no-border form-control-lg ${getFieldStatus("first_name")}`} // Remove border
            feedbackInvalid={errors.first_name}
          />
          <CFormLabel>
            Last Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="last_name"
            value={formData.last_name}
            placeholder="Last Name"
            onChange={handleInputChange}
            required
            className={`no-border form-control-lg ${getFieldStatus("last_name")}`} // Remove border
            feedbackInvalid={errors.last_name}
          />
          <CFormLabel>
            Email(User Name) <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter Your Email "
            onChange={handleInputChange}
            required
            className={`no-border form-control-lg ${getFieldStatus("email")}`} // Remove border
            feedbackInvalid={errors.email}
          />
          <CFormLabel>
            Password <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="password"
            name="password"
            value={formData.password}
            placeholder="Password"
            onChange={handleInputChange}
            required
            className={`no-border form-control-lg ${getFieldStatus("password")}`} // Remove border
            feedbackInvalid={errors.password}
          />
          <CFormLabel>
            Confirm Password <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            placeholder="Confirm Password"
            onChange={handleInputChange}
            required
            className={`no-border form-control-lg ${getFieldStatus("confirm_password")}`} // Remove border
            feedbackInvalid={errors.confirm_password}
          />
        <CButton type="submit" color="primary" className="w-100" disabled={loading}>
          {loading ? "Submitting..." : "Register"}
        </CButton>
      </CForm>
    </CContainer>
  );
};

export default RegistrationForm;




