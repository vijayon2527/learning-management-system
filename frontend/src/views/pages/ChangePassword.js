import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance"; // Ensure this points to your axios instance
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handles form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const { currentPassword, newPassword, confirmNewPassword } = formData;

    // Client-side validations
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/users/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });

      // If the response contains a success message, show it
      setMessage(response.data.detail || "Password updated successfully!");
    } catch (err) {
      // Log the full error to debug
      console.error("Error details:", err);

      if (err.response) {
        const errorData = err.response.data;

        // Handle specific backend validation errors
        if (errorData.current_password) {
          setError(`Current password error: ${errorData.current_password}`);
        } else if (errorData.new_password) {
          setError(`New password error: ${errorData.new_password}`);
        } else if (errorData.confirm_password) {
          setError(`Confirm password error: ${errorData.confirm_password}`);
        } else if (errorData.detail) {
          setError(errorData.detail); // General error
       }  
       else {
          setError("An unexpected error occurred. Please check your input.");
        }
      } else if (err.request) {
        // This happens when no response was received (network issues)
        setError("No response from server. Please check your internet connection.");
      } else {
        // This handles other errors like wrong configuration or other client-side issues
        setError("A network error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CContainer className="d-flex align-items-center justify-content-center min-vh-100">
      <CRow className="justify-content-center">
        <CCol md={18}>
          <CCardGroup>
            <CCard className="p-5 shadow-lg" style={{ borderRadius: "10px" }}>
              <CCardBody>
                <h2 className="text-center mb-4">Change Password</h2>
                <CForm onSubmit={handleSubmit}>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>🔒</CInputGroupText>
                    <CFormInput
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>🔐</CInputGroupText>
                    <CFormInput
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>🔁</CInputGroupText>
                    <CFormInput
                      type="password"
                      name="confirmNewPassword"
                      placeholder="Confirm New Password"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </CInputGroup>
                  <CButton color="primary" type="submit" block disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Change Password"}
                  </CButton>
                </CForm>
                {message && <p className="text-success text-center mt-3">{message}</p>}
                {error && <p className="text-danger text-center mt-3">{error}</p>}
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ChangePassword;
