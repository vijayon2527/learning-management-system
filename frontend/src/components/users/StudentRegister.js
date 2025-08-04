import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  CButton,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CRow,
  CCol,
  CAlert,
  CSpinner,
  CCard,
  CCardBody,
} from "@coreui/react";
import { toast } from "react-toastify";

const StudentRegister = () => {
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");
  const [genderOptions, setGenderOptions] = useState([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const resp = await axiosInstance.get("api/users/meta/");
        const meta = resp.data || {};
        setGenderOptions([
          { value: "", label: "Select Gender" },
          ...(meta.genders || []),
        ]);
      } catch (err) {
        setMetaError("Unable to load gender options. Using default.");
        setGenderOptions([
          { value: "", label: "Select Gender" },
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
        ]);
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, []);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = "First name is required.";
    if (!formData.last_name.trim()) e.last_name = "Last name is required.";
    if (!formData.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email.";
    if (!formData.password) e.password = "Password is required.";
    else if (formData.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (!formData.confirm_password)
      e.confirm_password = "Please confirm your password.";
    else if (formData.password !== formData.confirm_password)
      e.confirm_password = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    setSubmitting(true);
    setServerError("");

    const payload = {
      ...formData,
      user_type: "STUDENT",
    };

    try {
      await axiosInstance.post("api/users/student/register/", payload);
      toast.success("Registration successful! Please login.");
      window.dispatchEvent(new Event("show-login"));
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setServerError("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (metaLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
      <CCol md={6} lg={10}>
        <CCard className="shadow-sm rounded-4">
          <CCardBody>
            <h2 className="text-center mb-4">Create Your Account</h2>
            {metaError && <CAlert color="warning">{metaError}</CAlert>}
            {serverError && <CAlert color="danger">{serverError}</CAlert>}

            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>First Name *</CFormLabel>
                  <CFormInput
                    value={formData.first_name}
                    onChange={(e) => setField("first_name", e.target.value)}
                    invalid={!!errors.first_name}
                  />
                  {errors.first_name && (
                    <div className="text-danger small">{errors.first_name}</div>
                  )}
                </CCol>
                <CCol>
                  <CFormLabel>Last Name *</CFormLabel>
                  <CFormInput
                    value={formData.last_name}
                    onChange={(e) => setField("last_name", e.target.value)}
                    invalid={!!errors.last_name}
                  />
                  {errors.last_name && (
                    <div className="text-danger small">{errors.last_name}</div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Email *</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => setField("email", e.target.value)}
                    invalid={!!errors.email}
                  />
                  {errors.email && (
                    <div className="text-danger small">{errors.email}</div>
                  )}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Mobile</CFormLabel>
                  <CFormInput
                    value={formData.mobile}
                    onChange={(e) => setField("mobile", e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormLabel>Gender</CFormLabel>
                  <CFormSelect
                    value={formData.gender}
                    onChange={(e) => setField("gender", e.target.value)}
                  >
                    {genderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Password *</CFormLabel>
                  <CFormInput
                    type="password"
                    value={formData.password}
                    onChange={(e) => setField("password", e.target.value)}
                    invalid={!!errors.password}
                  />
                  {errors.password && (
                    <div className="text-danger small">{errors.password}</div>
                  )}
                </CCol>
                <CCol>
                  <CFormLabel>Confirm Password *</CFormLabel>
                  <CFormInput
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      setField("confirm_password", e.target.value)
                    }
                    invalid={!!errors.confirm_password}
                  />
                  {errors.confirm_password && (
                    <div className="text-danger small">
                      {errors.confirm_password}
                    </div>
                  )}
                </CCol>
              </CRow>

              <CButton type="submit" color="primary" className="w-100" disabled={submitting}>
                {submitting ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </CButton>

              <div className="text-center mt-3">
                Already have an account?{" "}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => window.dispatchEvent(new Event("show-login"))}
                >
                  Login
                </button>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CContainer>
  );
};

export default StudentRegister;
