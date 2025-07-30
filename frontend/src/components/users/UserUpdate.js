import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  CContainer,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CRow,
  CCol,
  CButton,
  CAlert,
  CSpinner,
} from "@coreui/react";
import { toast } from "react-toastify";

/* --------------------------------------------------
 * Option Lists (replace w/ API fetch if desired)
 * -------------------------------------------------- */
const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PNS", label: "Prefer not to say" },
];

const userTypeOptions = [
  { value: "", label: "Select User Type" },
  { value: "PLATFORM", label: "Platform" },
  { value: "STUDENT", label: "Student" },
  { value: "GENERIC", label: "Generic" },
];

// From PlatformUser.Role
const platformRoles = [
  { value: "", label: "Select Role" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "CONTENT_MANAGER", label: "Content Manager" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ANALYST", label: "Analyst" },
];

const UserUpdate = ({ userId, onUserUpdated, onClose }) => {
  /* --------------------------------
   * Local State
   * -------------------------------- */
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    user_type: "",
    role: "",      // Only used when user_type = PLATFORM
    is_active: true,
  });

  const [loading, setLoading] = useState(true);   // initial load spinner
  const [saving, setSaving] = useState(false);    // save spinner
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");


  const setField = (name, value) => {
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

 
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setServerError("");
      try {
        const resp = await axiosInstance.get(`api/users/user-detail/${userId}/`);
        if (cancelled) return;
        const u = resp.data;

        // role is top-level in your UserSerializer
        setFormData({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          email: u.email || "",
          gender: u.gender || "",
          user_type: u.user_type || "",
          role: u.role || "",                // only relevant if PLATFORM
          is_active: !!u.is_active,
        });
      } catch (err) {
        if (cancelled) return;
        setServerError("Unable to load user.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

 
  const validate = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = "Required.";
    if (!formData.last_name.trim()) e.last_name = "Required.";
    if (!formData.email.trim()) e.email = "Required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email.";
    if (!formData.user_type) e.user_type = "Required.";

    if (formData.user_type === "PLATFORM" && !formData.role) {
      e.role = "Select a role.";
    }
    return e;
  };

 
  const buildPayload = () => {
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      gender: formData.gender || null,
      user_type: formData.user_type,
      is_active: formData.is_active,
    };
    if (formData.user_type === "PLATFORM") {
      payload.role = formData.role; // backend will update/create PlatformUser
    }
    return payload;
  };

  /* --------------------------------
   * Submit
   * PUT api/users/update/:id/
   * -------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      const resp = await axiosInstance.put(`api/users/user-update/${userId}/`, payload);
      const updatedUser = resp.data?.user || resp.data;
      onUserUpdated?.(updatedUser);
      onClose?.();
      toast.success("User updated successfully.");
    } catch (err) {
      if (err.response?.data) {
        // Map DRF errors directly
        setErrors(err.response.data);
      } else {
        setServerError("Unable to save changes.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------
   * Render
   * -------------------------------- */
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <CContainer fluid>
      {serverError && <CAlert color="danger">{serverError}</CAlert>}

      <CForm onSubmit={handleSubmit}>
        {/* Name Row */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>First Name *</CFormLabel>
            <CFormInput
              name="first_name"
              value={formData.first_name}
              onChange={(e) => setField("first_name", e.target.value)}
              invalid={!!errors.first_name}
              feedbackInvalid={errors.first_name}
              required
            />
          </CCol>
          <CCol>
            <CFormLabel>Last Name *</CFormLabel>
            <CFormInput
              name="last_name"
              value={formData.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
              invalid={!!errors.last_name}
              feedbackInvalid={errors.last_name}
              required
            />
          </CCol>
        </CRow>

        {/* Email / Gender */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>Email *</CFormLabel>
            <CFormInput
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              invalid={!!errors.email}
              feedbackInvalid={errors.email}
              required
            />
          </CCol>
          <CCol>
            <CFormLabel>Gender</CFormLabel>
            <CFormSelect
              name="gender"
              value={formData.gender}
              onChange={(e) => setField("gender", e.target.value)}
            >
              {genderOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>

        {/* User Type / Role (conditional) */}
        <CRow className="mb-3">
          <CCol>
            <CFormLabel>User Type *</CFormLabel>
            <CFormSelect
              name="user_type"
              value={formData.user_type}
              onChange={(e) => setField("user_type", e.target.value)}
              invalid={!!errors.user_type}
              feedbackInvalid={errors.user_type}
              required
            >
              {userTypeOptions.map((ut) => (
                <option key={ut.value} value={ut.value}>
                  {ut.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol>
            {formData.user_type === "PLATFORM" && (
              <>
                <CFormLabel>Role *</CFormLabel>
                <CFormSelect
                  name="role"
                  value={formData.role}
                  onChange={(e) => setField("role", e.target.value)}
                  invalid={!!errors.role}
                  feedbackInvalid={errors.role}
                  required
                >
                  {platformRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </CFormSelect>
              </>
            )}
            {formData.user_type !== "PLATFORM" && (
              <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#6c757d" }}>
                {formData.user_type === "STUDENT"
                  ? "Student users do not have a role."
                  : formData.user_type === "GENERIC"
                  ? "Generic users do not have a role."
                  : ""}
              </div>
            )}
          </CCol>
        </CRow>

        {/* Status Toggle */}
        <CRow className="mb-4">
          <CCol>
            <CFormLabel>Status</CFormLabel>
            <div>
              <CFormSwitch
                id={`update-status-${userId}`}
                checked={formData.is_active}
                onChange={(e) => setField("is_active", e.target.checked)}
                className={`status-toggle ${formData.is_active ? "active" : "inactive"}`}
                label="" // hide text
                style={
                  formData.is_active
                    ? { "--cui-form-switch-checked-bg": "#28a745" }
                    : {
                        "--cui-form-switch-bg": "#dc3545",
                        "--cui-form-switch-border-color": "#dc3545",
                      }
                }
              />
            </div>
          </CCol>
        </CRow>

        {/* Save */}
        <CButton type="submit" color="primary" disabled={saving} className="w-100">
          {saving ? (
            <>
              <CSpinner size="sm" className="me-2" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </CButton>
        
      </CForm>
    </CContainer>
  );
};

export default UserUpdate;
