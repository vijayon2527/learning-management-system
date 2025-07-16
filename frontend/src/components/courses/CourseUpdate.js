import React, { useState, useEffect } from "react";
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CButton,
  CFormFeedback,
  CRow,
  CCol,
} from "@coreui/react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const notify = (msg) => toast(msg, { type: "success" });
const notifyError = (msg) => toast(msg, { type: "error" });

const CourseUpdate = ({ course, onUpdated, onClose, categories }) => {
  const [form, setForm] = useState({
    name: "",
    summary: "",
    description: "",
    category: "",
    visibility: "PAID",
    estimated_duration: "",
    enrollment_open: true,
  });

  const [logo, setLogo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [promoVideo, setPromoVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load existing course data into form
  useEffect(() => {
    if (course) {
      setForm({
        name: course.name || "",
        summary: course.summary || "",
        description: course.description || "",
        category: course.category || "",
        visibility: course.visibility || "paid",
        estimated_duration: course.estimated_duration || "",
        enrollment_open: course.enrollment_open ?? true,
      });
    }
  }, [course]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (form.name.length > 200) newErrors.name = "Name too long.";
    if (!form.summary || form.summary.trim() === "" || form.summary === "<p><br></p>")
      newErrors.summary = "Summary is required.";
    if (!form.description || form.description.trim() === "" || form.description === "<p><br></p>")
      newErrors.description = "Description is required.";
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
    setErrors({});
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("summary", form.summary.trim());
    formData.append("description", form.description.trim());
    formData.append("category", form.category);
    formData.append("visibility", form.visibility);
    formData.append("enrollment_open", form.enrollment_open);
    formData.append("estimated_duration", form.estimated_duration);

    if (logo) formData.append("logo", logo);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (promoVideo) formData.append("promotional_video", promoVideo);

    try {
      const response = await axiosInstance.patch(
        `/api/courses/courses/${course.slug}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      notify("Course updated successfully!");
      onUpdated(response.data);
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      const backendErrors = {};
      if (err.response?.data) {
        const data = err.response.data;
        ["name", "category", "logo", "thumbnail", "promotional_video"].forEach((field) => {
          if (data[field]) backendErrors[field] = data[field][0];
        });
        notifyError("Please correct the highlighted errors.");
      } else {
        notifyError("An unexpected error occurred.");
      }
      setErrors(backendErrors);
    } finally {
      setSubmitting(false);
    }
  };

  if (!course) return <p>Loading course data...</p>;

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Course Name</label>
          <CFormInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            invalid={!!errors.name}
          />
          {errors.name && <CFormFeedback className="d-block">{errors.name}</CFormFeedback>}
        </CCol>

        <CCol md={6}>
          <label className="form-label fw-semibold">Category</label>
          <CFormSelect
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            invalid={!!errors.category}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </CFormSelect>
          {errors.category && <CFormFeedback className="d-block">{errors.category}</CFormFeedback>}
        </CCol>
      </CRow>

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
          <label className="form-label fw-semibold">Estimated Duration</label>
          <CFormInput
            value={form.estimated_duration}
            onChange={(e) => setForm({ ...form, estimated_duration: e.target.value })}
            placeholder="e.g. 01:30:00"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Enrollment Open</label>
          <CFormCheck
            label="Allow enrollment"
            checked={form.enrollment_open}
            onChange={(e) => setForm({ ...form, enrollment_open: e.target.checked })}
          />
        </CCol>
      </CRow>

      <div className="mb-3">
        <label className="form-label fw-semibold">Summary</label>
        <ReactQuill
          theme="snow"
          value={form.summary}
          onChange={(value) => setForm({ ...form, summary: value })}
        />
        {errors.summary && <div className="invalid-feedback d-block">{errors.summary}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Description</label>
        <ReactQuill
          theme="snow"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
        />
        {errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
      </div>

      <CRow className="mb-3">
        <CCol md={6}>
          <label className="form-label fw-semibold">Logo</label>
          {course.logo && (
            <div className="mb-2">
              <img src={course.logo} alt="Logo" style={{ maxHeight: 80 }} />
            </div>
          )}
          <CFormInput type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
          {errors.logo && <div className="invalid-feedback d-block">{errors.logo}</div>}
        </CCol>

        <CCol md={6}>
          <label className="form-label fw-semibold">Thumbnail</label>
          {course.thumbnail && (
            <div className="mb-2">
              <img src={course.thumbnail} alt="Thumbnail" style={{ maxHeight: 80 }} />
            </div>
          )}
          <CFormInput type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
          {errors.thumbnail && <div className="invalid-feedback d-block">{errors.thumbnail}</div>}
        </CCol>
      </CRow>

      <div className="mb-3">
        <label className="form-label fw-semibold">Promotional Video</label>
        {course.promotional_video && (
          <div className="mb-2">
            <a href={course.promotional_video} target="_blank" rel="noopener noreferrer">
              View Current Video
            </a>
          </div>
        )}
        <CFormInput type="file" accept="video/mp4" onChange={(e) => setPromoVideo(e.target.files[0])} />
        {errors.promotional_video && (
          <div className="invalid-feedback d-block">{errors.promotional_video}</div>
        )}
      </div>

      <div className="d-flex justify-content-end">
        <CButton type="button" color="secondary" onClick={onClose} className="me-2">
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={submitting}>
          {submitting ? "Updating..." : "Update Course"}
        </CButton>
      </div>
    </CForm>
  );
};

export default CourseUpdate;
