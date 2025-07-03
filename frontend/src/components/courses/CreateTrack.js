import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CreateTrack = ({ courseId, onClose, onTrackAdded }) => {
  const [trackData, setTrackData] = useState({
    name: '',
    fee: '',
    recommended_for: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

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

    try {
      await axiosInstance.post(`/api/tracks/`, {
        ...trackData,
        course: courseId,
        is_active: false,
      });
      toast.success('Track created successfully!');
      onTrackAdded();
      onClose();
    } catch (err) {
      toast.error('Failed to create track');
    }
  };

  const renderField = (label, name, type, value, onChange, error, rows = 1) => (
    <div className="track-group">
      <label className="track-label">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="track-textarea"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="track-input"
          style={{ borderColor: error ? '#dc3545' : '#ccc' }}
        />
      )}
      {error && <span className="track-error">{error}</span>}
    </div>
  );

  return (
    <div className="track-backdrop">
      <div className="track-modal">
        <button onClick={onClose} className="track-close">❌</button>
        <h2 className="track-title">Create a New Track</h2>

        <form onSubmit={handleSubmit} className="track-form">
          {renderField('Track Name', 'name', 'text', trackData.name, handleChange, errors.name)}
          {renderField('Fee (INR)', 'fee', 'number', trackData.fee, handleChange, errors.fee)}
          {renderField('Recommended For', 'recommended_for', 'textarea', trackData.recommended_for, handleChange, '', 2)}

          <div className="track-group">
            <label className="track-label">Description</label>
            <CKEditor
              editor={ClassicEditor}
              data={trackData.description}
              onChange={(event, editor) => {
                const data = editor.getData();
                setTrackData((prev) => ({ ...prev, description: data }));
              }}
            />
          </div>

          <div className="track-submit-wrapper">
            <button type="submit" className="track-submit-btn">➕ Create Track</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrack;
