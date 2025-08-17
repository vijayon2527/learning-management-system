import React, { useState, useEffect } from "react";
import {
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFeedback,
} from "@coreui/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const notify = (message) => toast(message, { type: "success" });
const notifyError = (message) => toast(message, { type: "error" });

const CategoryUpdate = ({ category, onUpdated, onClose, categories }) => {
  const [form, setForm] = useState({
    name: category.name || "",
    description: category.description || "",
    parent: category.parent || "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(category.logo || null); // existing logo url if any
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Update preview when logoFile changes
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(category.logo || null);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile, category.logo]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (form.name.length > 200) {
      newErrors.name = "Name must be at most 200 characters.";
    }
    // Optionally add logo validation here
    return newErrors;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        notifyError("Only JPG or PNG images are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        notifyError("Image size should be less than 2MB.");
        return;
      }
      setLogoFile(file);
    }
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
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("parent", form.parent || "");
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await axiosInstance.put(
        `/api/courses/categories/${category.slug}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notify("Category updated successfully!");
      onUpdated(response.data);
      onClose();
    } catch (err) {
      console.error("Error updating category:", err);
      if (err.response && err.response.data) {
        const backendErrors = {};
        if (err.response.data.name) {
          backendErrors.name = err.response.data.name.join(" ");
        }
        if (err.response.data.parent) {
          backendErrors.parent = err.response.data.parent.join(" ");
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

      <label className="form-label">Description</label>
      <ReactQuill
        theme="snow"
        value={form.description}
        onChange={(content) => setForm({ ...form, description: content })}
        className="mb-3"
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        }}
      />

      <CFormSelect
        label="Parent Category"
        value={form.parent}
        onChange={(e) => setForm({ ...form, parent: e.target.value })}
        invalid={!!errors.parent}
        feedback={errors.parent}
        className="mb-3"
      >
        <option value="">-- None --</option>
        {categories
          .filter((c) => c.id !== category.id)
          .map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
      </CFormSelect>

      <CFormInput
        type="file"
        label="Logo (JPG or PNG, max 2MB)"
        onChange={handleLogoChange}
        invalid={!!errors.logo}
        feedback={errors.logo}
        accept="image/png, image/jpeg"
        className="mb-3"
      />
      {logoPreview && (
        <div
          style={{
            marginBottom: "1rem",
            width: 120,
            height: 120,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)",
            border: "1px solid #ccc",
          }}
        >
          <img
            src={logoPreview}
            alt="Logo Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

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
        {submitting ? "Updating..." : "Update Category"}
      </CButton>
    </div>
    </CForm>
  );
};

export default CategoryUpdate;
