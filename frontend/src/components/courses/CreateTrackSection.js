import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFeedback,
  CSpinner,
} from '@coreui/react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const CreateTrackSection = ({ onClose, onSectionAdded }) => {
  const { trackId: raw } = useParams();
  const trackId = Number(String(raw).replace(/\D/g, ''));

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_locked: false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ---------- validation ---------- */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) {
      e.name = "Section name is required";
    } else if (form.name.trim().length < 3) {
      e.name = "Section name must be at least 3 characters long";
    }
    return e;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSaving(true);
    try {
      await axiosInstance.post("/api/courses/sections/", {
        track: trackId,
        ...form,
      });
      toast.success("Section created successfully");
      onSectionAdded?.();
      onClose?.();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to create section");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CForm onSubmit={handleSubmit} noValidate>
      {/* Section Name */}
      <div className="mb-3">
        <CFormInput
          label="Section Name"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            setErrors((prev) => ({ ...prev, name: '' })); // Clear error on change
          }}
          invalid={!!errors.name}
        />
        {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
      </div>

      {/* Description with CKEditor */}
      <label className="form-label"><strong>Description</strong></label>
      <CKEditor
        editor={ClassicEditor}
        data={form.description}
        onChange={(_, editor) =>
          setForm({ ...form, description: editor.getData() })
        }
      />
      <div className="mb-3"></div>

      {/* Locked switch */}
      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          checked={form.is_locked}
          onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
        />
        <label className="form-check-label">
          Lock for non‑enrolled users
        </label>
      </div>

      {/* Buttons */}
      <div className="d-flex justify-content-end">
        <CButton color="secondary" className="me-2" onClick={onClose}>
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={saving}>
          {saving ? <CSpinner size="sm" /> : "Create Section"}
        </CButton>
      </div>
    </CForm>
  );
};

export default CreateTrackSection;
