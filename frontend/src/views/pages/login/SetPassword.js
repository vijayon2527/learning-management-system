import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
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
import { toast } from "react-toastify";

const SetPasswordForm = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const notify = (msg, type = "success") => {
    type === "error" ? toast.error(msg) : toast.success(msg);
  };

  const validatePasswordStrength = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    return regex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "This field is required.";
    } else if (!validatePasswordStrength(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "This field is required.";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const getFieldStatus = (field) =>
    errors[field] ? "is-invalid" : formData[field] ? "is-valid" : "";

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
      const token = localStorage.getItem("access");
      await axiosInstance.post(
        "/api/users/set-password/",
        { password: formData.password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notify("Password set successfully!");
      setFormData({ password: "", confirm_password: "" });
      setLoading(false);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      notify("Failed to set password. Try again.", "error");
      setLoading(false);
    }
  };

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-90">
      <CRow className="w-100 justify-content-center">
        <CCol xs={12} md={6} lg={5}>
          <CCard className="p-4 shadow" style={{ borderRadius: "1rem" }}>
            <CCardBody>
              <h2 className="text-center mb-4">Set Password</h2>
              <CForm onSubmit={handleSubmit} noValidate>
                <CFormLabel>
                  New Password <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
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
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`form-control-lg ${getFieldStatus("confirm_password")}`}
                />
                {errors.confirm_password && (
                  <div className="text-danger mb-3">{errors.confirm_password}</div>
                )}

                <CButton
                  type="submit"
                  color="primary"
                  className="w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? <CSpinner size="sm" /> : "Set Password"}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default SetPasswordForm;
