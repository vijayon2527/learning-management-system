import React, { useEffect, useState } from "react";
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

const SectionUpdate = ({ sectionId, onUpdated, onClose }) => {
  const [form, setForm]     = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* fetch existing */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/courses/sections/${sectionId}/`);
        setForm({
          name:        data.name        ?? "",
          description: data.description ?? "",
          is_active:   data.is_active,
        });
      } catch {
        toast.error("Failed to load section");
        onClose();
      }
    })();
  }, [sectionId]);

  /* validation */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Title required";
    return e;
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const { data } = await axiosInstance.patch(
        `/api/courses/sections/${sectionId}/`,
        {
          name:        form.name.trim(),
          description: form.description,
          is_active:   form.is_active,
        }
      );
      toast.success("Section updated successfully");
      onUpdated(data);
      onClose();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return (
      <div className="d-flex justify-content-center p-4">
        <CSpinner />
      </div>
    );

  return (
    <CForm onSubmit={handleSubmit} noValidate>
      {/* title ------------------------------------------------------- */}
      <CFormInput
        label="Section Title"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        invalid={!!errors.name}
        feedback={errors.name}
        className="mb-3"
      />

      {/* description ------------------------------------------------- */}
      <label className="form-label fw-semibold">Description</label>
      <CKEditor
        editor={ClassicEditor}
        data={form.description}
        onChange={(_, ed) =>
          setForm({ ...form, description: ed.getData() })
        }
      />
      <div className="mb-3" />

      {/* active toggle ---------------------------------------------- */}
      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) =>
            setForm({ ...form, is_active: e.target.checked })
          }
        />
        <label className="form-check-label fw-semibold">Active</label>
      </div>

      {/* buttons */}
      <div className="d-flex justify-content-end">
        <CButton color="secondary" className="me-2" onClick={onClose}>
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={saving}>
          {saving ? <CSpinner size="sm" /> : "Update Section"}
        </CButton>
      </div>
    </CForm>
  );
};

export default SectionUpdate;
