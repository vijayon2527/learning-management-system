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
} from "@coreui/react";
import { toast } from "react-toastify";

const Register = ({ onUserCreated, onClose }) => {
  // Meta data
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [genderOptions, setGenderOptions] = useState([]);
  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const [platformRoleOptions, setPlatformRoleOptions] = useState([]);
  const [educationLevelOptions, setEducationLevelOptions] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: "",
    user_type: "",
    platform_role: "",
    student_education_level: "",
    institution: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  /* ---------------------------
   * Load meta options
   * --------------------------- */
  useEffect(() => {
    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError("");
      try {
        const resp = await axiosInstance.get("api/users/meta/");
        const meta = resp.data || {};
        setGenderOptions([{ value: "", label: "Select Gender" }, ...(meta.genders || [])]);
        setUserTypeOptions([{ value: "", label: "Select User Type" }, ...(meta.user_types || [])]);
        setPlatformRoleOptions([{ value: "", label: "Select Role" }, ...(meta.platform_roles || [])]);
        setEducationLevelOptions([{ value: "", label: "Select Education Level" }, ...(meta.education_levels || [])]);
      } catch (err) {
        setMetaError("Unable to load form options. Using fallback values.");
        setGenderOptions([
          { value: "", label: "Select Gender" },
          { value: "MALE", label: "Male" },
          { value: "FEMALE", label: "Female" },
        ]);
        setUserTypeOptions([
          { value: "", label: "Select User Type" },
          { value: "PLATFORM", label: "Platform" },
          { value: "STUDENT", label: "Student" },
          { value: "GENERIC", label: "Generic" },
        ]);
        setPlatformRoleOptions([
          { value: "", label: "Select Role" },
          { value: "ADMIN", label: "Admin" },
        ]);
        setEducationLevelOptions([
          { value: "", label: "Select Education Level" },
          { value: "OTHER", label: "Other" },
        ]);
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, []);

  /* ---------------------------
   * Field setters
   * --------------------------- */
  const setField = (name, value) => {
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleUserTypeChange = (value) => {
    setFormData((s) => ({
      ...s,
      user_type: value,
      platform_role: value === "PLATFORM" ? s.platform_role : "",
      student_education_level: value === "STUDENT" ? s.student_education_level : "",
      institution: value === "STUDENT" ? s.institution : "",
    }));
    setErrors((e) => ({
      ...e,
      user_type: "",
      platform_role: "",
      student_education_level: "",
    }));
  };

  /* ---------------------------
   * Validation
   * --------------------------- */
  const validate = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = "This field is required.";
    if (!formData.last_name.trim()) e.last_name = "This field is required.";

    if (!formData.email.trim()) e.email = "This field is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format.";

    if (!formData.user_type) e.user_type = "This field is required.";

    if (!formData.password) e.password = "This field is required.";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters.";

    if (!formData.confirm_password) e.confirm_password = "This field is required.";
    else if (formData.password !== formData.confirm_password)
      e.confirm_password = "Passwords do not match.";

    if (formData.user_type === "PLATFORM" && !formData.platform_role) {
      e.platform_role = "This field is required.";
    }

    if (formData.user_type === "STUDENT" && !formData.student_education_level) {
      e.student_education_level = "This field is required.";
    }

    return e;
  };

  // Real-time validation for onBlur
  const handleBlur = (field) => {
    const v = validate();
    if (v[field]) setErrors((prev) => ({ ...prev, [field]: v[field] }));
  };

  /* ---------------------------
   * Submit
   * --------------------------- */
  const buildPayload = () => {
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim() || null,
      gender: formData.gender || null,
      user_type: formData.user_type,
      password: formData.password,
      confirm_password: formData.confirm_password,
    };
    if (formData.user_type === "PLATFORM") {
      payload.role = formData.platform_role;
    } else if (formData.user_type === "STUDENT") {
      if (formData.student_education_level) payload.education_level = formData.student_education_level;
      if (formData.institution) payload.institution = formData.institution.trim();
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const resp = await axiosInstance.post("api/users/register/", payload);
      const newUser = resp.data?.user || resp.data;
      toast.success("User registered successfully!");
      onUserCreated?.(newUser);
      onClose?.();
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data);
      else setServerError("Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------
   * Render
   * --------------------------- */
  if (metaLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <CContainer fluid className="modal-scrollable">
      {metaError && <CAlert color="warning">{metaError}</CAlert>}
      {serverError && <CAlert color="danger">{serverError}</CAlert>}

      <CForm onSubmit={handleSubmit}>
        {/* Name row */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>First Name *</CFormLabel>
            <CFormInput
              name="first_name"
              value={formData.first_name}
              onChange={(e) => setField("first_name", e.target.value)}
              onBlur={() => handleBlur("first_name")}
              invalid={!!errors.first_name}
              feedbackInvalid={errors.first_name}
            />
          </CCol>
          <CCol>
            <CFormLabel>Last Name *</CFormLabel>
            <CFormInput
              name="last_name"
              value={formData.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
              onBlur={() => handleBlur("last_name")}
              invalid={!!errors.last_name}
              feedbackInvalid={errors.last_name}
            />
          </CCol>
        </CRow>

        {/* Email & Gender */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>Email *</CFormLabel>
            <CFormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              invalid={!!errors.email}
              feedbackInvalid={errors.email}
            />
          </CCol>
        </CRow>

        {/* Mobile */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>Mobile</CFormLabel>
            <CFormInput
              name="mobile"
              value={formData.mobile}
              onChange={(e) => setField("mobile", e.target.value)}
            />
          </CCol>
        </CRow>

        {/* User type */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>User Type *</CFormLabel>
            <CFormSelect
              name="user_type"
              value={formData.user_type}
              onChange={(e) => handleUserTypeChange(e.target.value)}
              onBlur={() => handleBlur("user_type")}
              invalid={!!errors.user_type}
              feedbackInvalid={errors.user_type}
            >
              {userTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol>
            {formData.user_type === "PLATFORM" && (
              <>
                <CFormLabel>Role *</CFormLabel>
                <CFormSelect
                  name="platform_role"
                  value={formData.platform_role}
                  onChange={(e) => setField("platform_role", e.target.value)}
                  onBlur={() => handleBlur("platform_role")}
                  invalid={!!errors.platform_role}
                  feedbackInvalid={errors.platform_role}
                >
                  {platformRoleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </CFormSelect>
              </>
            )}

            {formData.user_type === "STUDENT" && (
              <>
                <CFormLabel>Education Level *</CFormLabel>
                <CFormSelect
                  name="student_education_level"
                  value={formData.student_education_level}
                  onChange={(e) => setField("student_education_level", e.target.value)}
                  onBlur={() => handleBlur("student_education_level")}
                  invalid={!!errors.student_education_level}
                  feedbackInvalid={errors.student_education_level}
                >
                  {educationLevelOptions.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </CFormSelect>
              </>
            )}
          </CCol>
        </CRow>

        {/* Institution */}
        {formData.user_type === "STUDENT" && (
          <CRow className="mb-3">
            <CCol>
              <CFormLabel>Institution</CFormLabel>
              <CFormInput
                name="institution"
                value={formData.institution}
                onChange={(e) => setField("institution", e.target.value)}
              />
            </CCol>
          </CRow>
        )}

        {/* Passwords */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>Password *</CFormLabel>
            <CFormInput
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setField("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              invalid={!!errors.password}
              feedbackInvalid={errors.password}
            />
          </CCol>
          <CCol>
            <CFormLabel>Confirm Password *</CFormLabel>
            <CFormInput
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={(e) => setField("confirm_password", e.target.value)}
              onBlur={() => handleBlur("confirm_password")}
              invalid={!!errors.confirm_password}
              feedbackInvalid={errors.confirm_password}
            />
          </CCol>
        </CRow>

        <CButton type="submit" color="primary" className="w-100" disabled={submitting}>
          {submitting ? (
            <>
              <CSpinner size="sm" className="me-2" /> Creating...
            </>
          ) : (
            "Register"
          )}
        </CButton>
      </CForm>
    </CContainer>
  );
};

export default Register;