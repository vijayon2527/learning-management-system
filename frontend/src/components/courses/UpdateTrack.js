// src/components/tracks/UpdateTrack.js

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const UpdateTrack = ({ trackId, onClose, onTrackUpdated }) => {
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTrack = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/courses/tracks/${trackId}/`);
        setTrackData(res.data);
      } catch (error) {
        toast.error('Failed to load track details.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (trackId) fetchTrack();
  }, [trackId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrackData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!trackData.name.trim()) newErrors.name = 'Enter Track Name';
    if (!trackData.fee) newErrors.fee = 'Enter Fee';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.put(`/api/courses/tracks/${trackId}/`, trackData);
      toast.success('Track updated successfully!');
      onTrackUpdated();
      onClose();
    } catch {
      toast.error('Failed to update track.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !trackData) return null;

  return (
    <div className="track-backdrop">
      <div className="track-modal">
        <button onClick={onClose} className="track-close">❌</button>
        <h2 className="track-title">Update  – {trackData.name}</h2>
        <form onSubmit={handleSubmit} className="track-form">
          <div className="track-group">
            <label>Track Name</label>
            <input name="name" value={trackData.name} onChange={handleChange} />
            {errors.name && <span className="track-error">{errors.name}</span>}
          </div>

          <div className="track-group">
            <label>Fee (INR)</label>
            <input name="fee" type="number" value={trackData.fee} onChange={handleChange} />
            {errors.fee && <span className="track-error">{errors.fee}</span>}
          </div>

          <div className="track-group">
            <label>Recommended For</label>
            <textarea
              name="recommended_for"
              value={trackData.recommended_for || ''}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="track-group">
            <label>Description</label>
            <CKEditor
              editor={ClassicEditor}
              data={trackData.description}
              onChange={(event, editor) => {
                const data = editor.getData();
                setTrackData((prev) => ({ ...prev, description: data }));
              }}
            />
          </div>

          <button type="submit" className="track-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Update Track'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateTrack;
