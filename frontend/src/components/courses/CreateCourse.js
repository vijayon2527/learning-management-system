import React, { useState } from "react";
import {
  CForm, CFormInput, CFormSelect, CFormCheck, CButton,
  CCol, CRow
} from "@coreui/react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const notify = (msg) => toast(msg, { type: "success" });
const notifyError = (msg) => toast(msg, { type: "error" });

const CourseCreate = ({ onCreated, onClose, categories }) => {
  const [form, setForm] = useState({
    name: "",
    summary: "",
    description: "",
    category: "",
    visibility: "paid",
    enrollment_open: true,
    estimated_duration: "",
  });

  const [logo, setLogo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [promoVideo, setPromoVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Course name is required.";
    if (form.name.length > 200) newErrors.name = "Name too long.";

    const plainSummary = form.summary.replace(/<[^>]+>/g, "").trim();
    if (!plainSummary) newErrors.summary = "Summary is required.";

    const plainDescription = form.description.replace(/<[^>]+>/g, "").trim();
    if (!plainDescription) newErrors.description = "Description is required.";

    if (!form.category) newErrors.category = "Category is required.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("summary", form.summary);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("visibility", form.visibility);
    formData.append("enrollment_open", form.enrollment_open);
    formData.append("estimated_duration", form.estimated_duration);

    if (logo) formData.append("logo", logo);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (promoVideo) formData.append("promotional_video", promoVideo);

    try {
      const res = await axiosInstance.post("/api/courses/courses/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify("Course created successfully!");
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      const backendErrors = {};
      if (err.response?.data) {
        const data = err.response.data;

        if (data.name) {
          backendErrors.name = data.name[0];
          notifyError(data.name[0]);
        }

        if (data.category) {
          backendErrors.category = data.category[0];
          notifyError(data.category[0]);
        }

        if (data.logo) {
          backendErrors.logo = data.logo[0];
          notifyError(data.logo[0]);
        }

        if (data.thumbnail) {
          backendErrors.thumbnail = data.thumbnail[0];
          notifyError(data.thumbnail[0]);
        }

        if (data.promotional_video) {
          backendErrors.promotional_video = data.promotional_video[0];
          notifyError(data.promotional_video[0]);
        }
      } else {
        notifyError("Something went wrong.");
      }

      setErrors(backendErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CForm onSubmit={handleSubmit}>

      {/* Name & Category */}
      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Course Name</label>
          <CFormInput
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              clearError("name");
            }}
            placeholder="Enter course name"
            invalid={!!errors.name}
          />
          {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
        </CCol>

        <CCol md={6}>
          <label className="form-label fw-semibold">Category</label>
          <CFormSelect
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
              clearError("category");
            }}
            invalid={!!errors.category}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </CFormSelect>
          {errors.category && <div className="invalid-feedback d-block">{errors.category}</div>}
        </CCol>
      </CRow>

      {/* Visibility & Logo */}
      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Visibility</label>
          <CFormSelect
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
            >
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </CFormSelect>

        </CCol>

        <CCol md={6}>
          <label className="form-label fw-semibold">Logo</label>
          <CFormInput
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
          />
          {errors.logo && <div className="invalid-feedback d-block">{errors.logo}</div>}
        </CCol>
      </CRow>

      {/* Duration & Video */}
      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Estimated Duration (hh:mm:ss)</label>
          <CFormInput
            value={form.estimated_duration}
            onChange={(e) => setForm({ ...form, estimated_duration: e.target.value })}
            placeholder="e.g. 01:30:00"
          />
        </CCol>

        <CCol md={6}>
          <label className="form-label fw-semibold">Promotional Video</label>
          <CFormInput
            type="file"
            accept="video/mp4"
            onChange={(e) => setPromoVideo(e.target.files[0])}
          />
          {errors.promotional_video && <div className="invalid-feedback d-block">{errors.promotional_video}</div>}
        </CCol>
      </CRow>

      {/* Thumbnail & Enrollment */}
      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Thumbnail</label>
          <CFormInput
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
          />
          {errors.thumbnail && <div className="invalid-feedback d-block">{errors.thumbnail}</div>}
        </CCol>

        <CCol md={6} className="d-flex align-items-end">
          <CFormCheck
            label="Enrollment Open"
            checked={form.enrollment_open}
            onChange={(e) => setForm({ ...form, enrollment_open: e.target.checked })}
          />
        </CCol>
      </CRow>

      {/* Summary */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Summary</label>
        <ReactQuill
          value={form.summary}
          onChange={(value) => {
            setForm({ ...form, summary: value });
            clearError("summary");
          }}
        />
        {errors.summary && <div className="invalid-feedback d-block">{errors.summary}</div>}
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Description</label>
        <ReactQuill
          value={form.description}
          onChange={(value) => {
            setForm({ ...form, description: value });
            clearError("description");
          }}
        />
        {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
      </div>

      {/* Submit */}
      <div className="d-flex justify-content-end">
        <CButton type="button" color="secondary" onClick={onClose} className="me-2">
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={submitting}>
          {submitting ? "Creating..." : "Create Course"}
        </CButton>
      </div>
    </CForm>
  );
};

export default CourseCreate;
