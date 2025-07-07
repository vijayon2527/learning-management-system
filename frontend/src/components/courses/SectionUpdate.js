import React, { useEffect, useState } from 'react';
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
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* fetch existing */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/courses/sections/${sectionId}/`);
        setForm({
          title:        data.title        ?? '',
          overview:     data.overview     ?? '',
          media_type:   data.media_type   ?? '',
          external_url: data.external_url ?? '',
          is_active:    data.is_active,
          filePath:     data.file        ?? '',
          thumbPath:    data.thumbnail   ?? '',
        });
      } catch {
        toast.error('Failed to load section');
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [sectionId]);

  /* validation */
  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.media_type) e.media_type = 'Choose a media type';
    if (form.media_type === 'link' && !form.external_url.trim())
      e.external_url = 'URL required';
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
      const isMultipart = file || thumbnail;
      const payload = isMultipart ? new FormData() : {};
      const put = (k, v) =>
        isMultipart ? payload.append(k, v) : (payload[k] = v);

      Object.entries({
        title: form.title,
        overview: form.overview,
        media_type: form.media_type,
        external_url: form.external_url,
        is_active: form.is_active,
      }).forEach(([k, v]) => put(k, v));

      if (file) payload.append('file', file);
      if (thumbnail) payload.append('thumbnail', thumbnail);

      const { data } = await axiosInstance.patch(
        `/api/courses/sections/${sectionId}/`,
        payload,
        isMultipart
          ? {
              headers: { 'Content-Type': 'multipart/form-data' },
              transformRequest: (d) => d,
            }
          : {}
      );
      toast.success('Section updated successfully');
      onUpdated(data);
      onClose();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form)
    return (
      <div className="d-flex justify-content-center p-4">
        <CSpinner />
      </div>
    );

  const showName = (p) => (p ? p.split('/').pop() : '—');

  return (
    <div className="section-update-wrapper">
    <CForm onSubmit={handleSubmit} noValidate>
      {/* title */}
      <CFormInput
        label="Section Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        invalid={!!errors.title}
        feedback={errors.title}
        className="mb-3"
      />

      {/* overview */}
      <label className="form-label"> <strong>Overview</strong></label>
      <CKEditor
        editor={ClassicEditor}
        data={form.overview}
        onChange={(_, ed) => setForm({ ...form, overview: ed.getData() })}
      />
      <div className="mb-3"></div>

      {/* media type */}
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

      {/* external URL */}
      {form.media_type === 'link' && (
        <CFormInput
          type="url"
          label="External URL"
          value={form.external_url}
          onChange={(e) => setForm({ ...form, external_url: e.target.value })}
          invalid={!!errors.external_url}
          feedback={errors.external_url}
          className="mb-3"
        />
      )}

      {/* file & thumb */}
      {['video', 'image', 'file'].includes(form.media_type) && (
        <CFormInput
          type="file"
          label={`Replace File (${showName(form.filePath)})`}
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-3"
        />
      )}
      <CFormInput
        type="file"
        label={`Replace Thumbnail (${showName(form.thumbPath)})`}
        accept="image/*"
        onChange={(e) => setThumbnail(e.target.files[0])}
        className="mb-3"
      />

      {/* active */}
      <div className="form-check form-switch mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        <label className="form-check-label">  <strong>Active</strong></label>
      </div>

      {/* buttons */}
      <div className="d-flex justify-content-end">
        <CButton color="secondary" variant="" className="me-2" onClick={onClose}>
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={saving}>
          {saving ? <CSpinner size="sm" /> : 'Update Section'}
        </CButton>
      </div>
    </CForm>
    </div>
  );
};

export default SectionUpdate;
