// src/components/sections/CreateTrackSection.js
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
    title: '',
    overview: '',
    media_type: '',
    external_url: '',
    is_active: true,
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ---------- validation ---------- */
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (['video', 'image', 'file'].includes(form.media_type) && !file)
      e.file = 'Upload a file for this media type';
    if (form.media_type === 'link' && !form.external_url.trim())
      e.external_url = 'URL is required';
    return e;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('track', trackId);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      if (thumbnail) fd.append('thumbnail', thumbnail);

      await axiosInstance.post('/api/courses/sections/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (d) => d,
      });

      toast.success('Section created');
      onSectionAdded();
      onClose();
    } catch (err) {
      console.error(err.response?.data);
      toast.error('Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- helpers ---------- */
  const input = (label, name, type = 'text') => (
    <CFormInput
      label={label}
      type={type}
      name={name}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      invalid={!!errors[name]}
      feedback={errors[name]}
      className="mb-3"
    />
  );

  /* ---------- JSX ---------- */
  return (
    <CForm onSubmit={handleSubmit} noValidate>
      {input('Section Title', 'title')}

      <label className="form-label">Overview</label>
      <CKEditor
        editor={ClassicEditor}
        data={form.overview}
        onChange={(_, ed) => setForm({ ...form, overview: ed.getData() })}
      />
      <div className="mb-3"></div>

      <CFormSelect
        label="Media Type"
        value={form.media_type}
        onChange={(e) => setForm({ ...form, media_type: e.target.value })}
        invalid={!!errors.media_type}
        feedback={errors.media_type}
        className="mb-3"
      >
        <option value="">-- Select --</option>
        <option value="video">Video</option>
        <option value="image">Image</option>
        <option value="file">File / PDF</option>
        <option value="link">External Link</option>
      </CFormSelect>

      {form.media_type === 'link' && input('External URL', 'external_url', 'url')}

      {['video', 'image', 'file'].includes(form.media_type) && (
        <div className="mb-3">
          <CFormInput
            type="file"
            label="Upload File"
            onChange={(e) => setFile(e.target.files[0])}
            invalid={!!errors.file}
            feedback={errors.file}
          />
        </div>
      )}

      <CFormInput
        type="file"
        label="Thumbnail (optional)"
        onChange={(e) => setThumbnail(e.target.files[0])}
        className="mb-3"
      />

      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) =>
            setForm({ ...form, is_active: e.target.checked })
          }
        />
        <label className="form-check-label">Active</label>
      </div>

      <div className="d-flex justify-content-end">
        <CButton color="secondary" variant="" className="me-2" onClick={onClose}>
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={saving}>
          {saving ? <CSpinner size="sm" /> : 'Create Section'}
        </CButton>
      </div>
    </CForm>
  );
};

export default CreateTrackSection;
