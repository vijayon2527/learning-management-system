import React, { useState } from "react";
import {
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFeedback,
} from "@coreui/react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const notify = (message) => toast(message, { type: "success" });
const notifyError = (message) => toast(message, { type: "error" });

const CourseCreate = ({ onCreated, onClose, categories }) => {
  const [form, setForm] = useState({
    name: "",
    summary: "",
    category: "",
  });
  const [logo, setLogo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (form.name.length > 200) {
      newErrors.name = "Name must be at most 200 characters.";
    }
    if (
      !form.summary ||
      form.summary.trim() === "" ||
      form.summary === "<p><br></p>"
    ) {
      newErrors.summary = "Summary is required.";
    }
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

    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("summary", form.summary.trim());
      if (form.category) {
        formData.append("category", form.category);
      }
      if (logo) {
        formData.append("logo", logo);
      }

      const response = await axiosInstance.post(
        "/api/courses/courses/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notify("Course created successfully!");
      onCreated(response.data);
      onClose();
    } catch (err) {
      console.error("Error creating course:", err);
      if (err.response && err.response.data) {
        const backendErrors = {};
        if (err.response.data.name) {
          backendErrors.name = err.response.data.name.join(" ");
        }
        if (err.response.data.category) {
          backendErrors.category = err.response.data.category.join(" ");
        }
        if (err.response.data.logo) {
          backendErrors.logo = err.response.data.logo.join(" ");
        }
        setErrors(backendErrors);
        notifyError("Please correct the errors in the form.");
      } else {
        notifyError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CForm onSubmit={handleSubmit} noValidate>
      <CFormInput
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        invalid={!!errors.name}
        feedback={errors.name}
        className="mb-3"
      />

      <div className="mb-3">
        <label className="form-label fw-semibold">Summary</label>
        <ReactQuill
          theme="snow"
          value={form.summary}
          onChange={(value) => setForm({ ...form, summary: value })}
        />
        {errors.summary && (
          <div className="invalid-feedback d-block">{errors.summary}</div>
        )}
      </div>

      <CFormSelect
        label="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        invalid={!!errors.category}
        feedback={errors.category}
        className="mb-3"
      >
        <option value="">-- None --</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </CFormSelect>

      <div className="mb-3">
        <label className="form-label fw-semibold">Logo</label>
        <input
          type="file"
          accept="image/*"
          className={`form-control ${errors.logo ? "is-invalid" : ""}`}
          onChange={(e) => setLogo(e.target.files[0])}
        />
        {errors.logo && (
          <div className="invalid-feedback d-block">{errors.logo}</div>
        )}
      </div>

      <div className="d-flex justify-content-end">
        <CButton
          type="button"
          color="secondary"
          onClick={onClose}
          className="me-2"
        >
          Cancel
        </CButton>
        <CButton type="submit" color="primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create"}
        </CButton>
      </div>
    </CForm>
  );
};

export default CourseCreate;
