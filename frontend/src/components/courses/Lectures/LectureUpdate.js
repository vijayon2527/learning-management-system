import React, { useEffect, useState } from 'react';
import { CFormInput, CFormCheck, CButton, CSpinner, CAlert } from '@coreui/react';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axiosInstance';

const LectureUpdate = ({ lecture, onClose, onUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    is_preview: false,
    is_locked: false,
    release_date: null,
    video: null,
  });

  useEffect(() => {
    if (lecture) {
      setForm({
        name: lecture.name || '',
        is_preview: lecture.is_preview || false,
        is_locked: lecture.is_locked || false,
        release_date: lecture.release_date ? new Date(lecture.release_date) : null,
        video: null,
      });
    }
  }, [lecture]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onFile = (e) => setForm((prev) => ({ ...prev, video: e.target.files[0] }));

  const onDateChange = (date) => setForm((prev) => ({ ...prev, release_date: date }));

const save = async (e) => {
  e.preventDefault();
  if (!form.name.trim()) {
    toast.error('Lecture name is required');
    return;
  }

  setSaving(true);
  setError('');

  try {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('is_preview', form.is_preview);
    fd.append('is_locked', form.is_locked);
    if (form.release_date) {
      fd.append('release_date', form.release_date.toISOString());
    }
    if (form.video) {
      fd.append('video', form.video);
    }

    await axiosInstance.patch(`/api/courses/lectures/${lecture.id}/`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Lecture updated successfully!');
    onUpdated();
    onClose();
  } catch (err) {
    console.error(err);
    setError('Failed to update lecture.');
    toast.error('Update failed.');
  } finally {
    setSaving(false);
  }
};


  return (
    <form onSubmit={save}>
      {error && <CAlert color="danger">{error}</CAlert>}

      <CFormInput
        label="Lecture Name"
        name="name"
        value={form.name}
        onChange={onChange}
        className="mb-3"
        required
      />

      <CFormInput
        type="file"
        accept="video/*"
        label="Replace Video (optional)"
        onChange={onFile}
        className="mb-3"
      />

      <div className="mb-3">
        <label className="form-label">Release Date</label>
        <DatePicker
          selected={form.release_date}
          onChange={onDateChange}
          dateFormat="yyyy-MM-dd HH:mm"
          showTimeSelect
          className="form-control"
          placeholderText="Select release date and time"
        />
      </div>

      <CFormCheck
        label="Previewable (free)"
        name="is_preview"
        checked={form.is_preview}
        onChange={onChange}
        className="mb-2"
      />

      <CFormCheck
        label="Locked until enrolled"
        name="is_locked"
        checked={form.is_locked}
        onChange={onChange}
        className="mb-3"
      />

      <div className="d-flex justify-content-end">
        <CButton color="secondary" onClick={onClose} className="me-2">
          Cancel
        </CButton>
        <CButton type="submit" color="success" disabled={saving}>
          {saving ? <CSpinner size="sm" /> : 'Update Lecture'}
        </CButton>
      </div>
    </form>
  );
};

export default LectureUpdate;
