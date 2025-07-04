import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CButton,
  CTooltip,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft, cilPen, cilTrash } from '@coreui/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axiosInstance from '../../utils/axiosInstance';
import CreateTrack from './CreateTrack';
import UpdateTrack from './UpdateTrack';
import ConfirmDialog from './ConfirmDialog';

const stripHtmlTags = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  /* ─────────────────────── Course state ─────────────────────── */
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [errorCourse, setErrorCourse] = useState(null);

  /* ───────────────────── Feature/Track state ─────────────────── */
  const [tracks, setTracks] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);

  const [newFeature, setNewFeature] = useState('');
  const [newFeatureValues, setNewFeatureValues] = useState({});
  const [errors, setErrors] = useState({});
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [inputStatus, setInputStatus] = useState({});
  const [newFeatureInputStatus, setNewFeatureInputStatus] = useState({});

  /* dialog / modal state */
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editTrackId, setEditTrackId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmType, setConfirmType] = useState('delete');
  const [selectedItem, setSelectedItem] = useState(null);
  const [courseName, setCourseName] = useState('');

  /* ───────────────────────── Fetching ───────────────────────── */
  useEffect(() => {
  axiosInstance.get(`/api/courses/courses/${courseId}/`).then((res) => {
    setCourseName(res.data.name);
  });
}, []);

  useEffect(() => {
    if (!courseId) return;

    const fetchAll = async () => {
      try {
        // Course
        const courseRes = await axiosInstance.get(`/api/courses/courses/${courseId}/`);
        setCourse(courseRes.data);

        // Tracks, features, values
        const [tRes, fRes, vRes] = await Promise.all([
          axiosInstance.get(`/api/courses/tracks/?course_id=${courseId}`),
          axiosInstance.get(`/api/courses/features/?course_id=${courseId}`),
          axiosInstance.get(`/api/courses/feature-values/?course_id=${courseId}`),
        ]);
        setTracks(tRes.data);
        setFeatures(fRes.data);
        setFeatureValues(vRes.data);
      } catch (err) {
        console.error(err);
        setErrorCourse('Failed to load data.');
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchAll();
  }, [courseId]);

  /* ───────────────────────── Helpers ────────────────────────── */
  const getValue = (trackId, featureId) => {
    const item = featureValues.find(
      (fv) => fv.track.id === trackId && fv.feature.id === featureId,
    );
    return item ? item.value || '' : '';
  };
  const getValueId = (trackId, featureId) => {
    const item = featureValues.find(
      (fv) => fv.track.id === trackId && fv.feature.id === featureId,
    );
    return item ? item.id : null;
  };

  const clearError = key =>
  setErrors(prev => {
    const { [key]: _removed, ...rest } = prev;
    return rest;
  });

  /* ───────────────────── Feature value edit ─────────────────── */
  const handleValueChange = (trackId, featureId, value) => {
    const existing = featureValues.find(
      (fv) => fv.track.id === trackId && fv.feature.id === featureId,
    );
    if (existing) {
      setFeatureValues((prev) =>
        prev.map((fv) =>
          fv.track.id === trackId && fv.feature.id === featureId ? { ...fv, value } : fv,
        ),
      );
    } else {
      setFeatureValues((prev) => [
        ...prev,
        { id: null, track: { id: trackId }, feature: { id: featureId }, value },
      ]);
    }

    const key = `${trackId}_${featureId}`;
    setInputStatus((p) => ({ ...p, [key]: value.trim() ? 'is-valid' : '' }));
  };

  const handleUpdateValue = async (featureId) => {
    try {
      await Promise.all(
        tracks.map(async (track) => {
          const id = getValueId(track.id, featureId);
          const value = getValue(track.id, featureId);
          if (id) {
            return axiosInstance.put(`/api/courses/feature-values/${id}/`, {
              id,
              track: track.id,
              feature: featureId,
              value,
            });
          }
          return axiosInstance.post(`/api/courses/feature-values/`, {
            track: track.id,
            feature: featureId,
            value,
          });
        }),
      );
      toast.success('Feature values saved!');
      // refetch to stay in sync
      const v = await axiosInstance.get(`/api/courses/feature-values/?course_id=${courseId}`);
      setFeatureValues(v.data);
    } catch {
      toast.error('Failed to save values');
    }
  };

  /* ───────────────────── Track helpers (status, delete, etc.) ─ */
  const confirmActionWrapper = (actionFn, title, message, item, type = 'delete') => {
    setConfirmText({ title, message });
    setConfirmAction(() => actionFn);
    setConfirmType(type);
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const toggleTrackStatus = async (trackId, current) => {
    try {
      await axiosInstance.patch(`/api/courses/tracks/${trackId}/`, { is_active: !current });
      const res = await axiosInstance.get(`/api/courses/tracks/?course_id=${courseId}`);
      setTracks(res.data);
      toast.success(!current ? 'Track activated  successfully' : 'Track deactivated  successfully');
    } catch {
      toast.error('Failed to update track status');
    }
  };
  

  const deleteTrack = async (id) => {
    try {
      await axiosInstance.delete(`/api/courses/tracks/${id}/`);
      fetchTracks(); // defined below
      toast.success('Track deleted');
    } catch {
      toast.error('Failed to delete track');
    }
  };

  const deleteFeature = async (id) => {
    try {
      await axiosInstance.delete(`/api/courses/features/${id}/`);
      fetchFeatures(); // defined below
      fetchFeatureValues();
      toast.success('Feature deleted');
    } catch {
      toast.error('Failed to delete feature');
    }
  };

  /* quick re‑fetch helpers */
  const fetchTracks = async () =>
    setTracks((await axiosInstance.get(`/api/courses/tracks/?course_id=${courseId}`)).data);
  const fetchFeatures = async () =>
    setFeatures((await axiosInstance.get(`/api/courses/features/?course_id=${courseId}`)).data);
  const fetchFeatureValues = async () =>
    setFeatureValues(
      (await axiosInstance.get(`/api/courses/feature-values/?course_id=${courseId}`)).data,
    );

  /* ───────────────────── Add feature with validation ────────── */
 const handleAddFeature = async () => {
  const validationErrors = {};

  if (!newFeature.trim()) {
    validationErrors.newFeature = 'Feature name is required.';
  }

  /* 2️⃣  each track value */
  tracks.forEach(track => {
    const val = (newFeatureValues[track.id] || '').trim();
    if (!val) validationErrors[`value_${track.id}`] = `Value required for ${track.name}`;
  });

  
  if (Object.keys(validationErrors).length) {
    setErrors(validationErrors);
    return;
  }

  
  try {
    const { data } = await axiosInstance.post('/api/features/', {
      name: newFeature.trim(),
      order: features.length,
      course: courseId,
    });

    await Promise.all(
      Object.entries(newFeatureValues).map(([trackId, v]) =>
        axiosInstance.post('/api/feature-values/', {
          track: Number(trackId),
          feature: data.id,
          value: v.trim(),
        }),
      ),
    );

    /* 5️⃣  reset */
    setNewFeature('');
    setNewFeatureValues({});
    setErrors({});
    toast.success('Feature and values added successfully!');
    fetchFeatures();
    fetchFeatureValues();
  } catch {
    toast.error('Failed to add feature.');
  }
};

  /* ─────────────────────────── Render ───────────────────────── */
  if (loadingCourse) {
    return (
      <div className="d-flex justify-content-center p-4">
        <CSpinner />
      </div>
    );
  }
  if (errorCourse) {
    return (
      <div className="text-danger text-center p-4">
        {errorCourse}
        <div className="mt-3">
          <CButton color="secondary" onClick={() => navigate(-1)}>
            Back
          </CButton>
        </div>
      </div>
    );
  }
  if (!course) return null;

  return (
    <CContainer fluid className="p-2 bg-light">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <h2 className="mb-1">Course Details</h2>
        <CTooltip content="Go back">
          <CButton
            color="light"
            className="text-dark border border-secondary"
            onClick={() => navigate('/dashboard/course-list')}
            style={{
              fontWeight: 600,
              borderRadius: '2rem',
              padding: '0.45rem 1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CIcon icon={cilArrowLeft} className="me-2" />
            Back
          </CButton>
        </CTooltip>
      </div>

      {/* ─── Course Info Card ─── */}
     <CCard className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <CCardBody className="py-2 px-3">
          {/* ─── Course Info Row ─── */}
          <div
            className="d-flex flex-wrap align-items-start"
            style={{ gap: '2rem' }} // ← adds space between fields
          >
            <div>
              <span className="text-muted small">🎓 Course</span>
              <div className="fw-semibold">{course.name}</div>
            </div>

            <div>
              <span className="text-muted small">📁 Category</span>
              <div className="fw-semibold">{course.category_name || '—'}</div>
            </div>

            <div>
              <span className="text-muted small">⚙️ Status</span>
              <div
                className={`fw-semibold ${
                  course.is_active ? 'text-success' : 'text-danger'
                }`}
              >
                {course.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div>
              <span className="text-muted small">📅 Created At</span>
              <div className="fw-semibold">
                {new Date(course.created_at).toLocaleString()}
              </div>
            </div>

          </div>

          {/* ─── Summary Section ─── */}
          {course.summary && (
            <div className="mt-4">
              <span className="text-muted small">📝 Summary</span>
              <div
                className="p-2 mt-1"
                style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  color: '#333',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.95rem',
                }}
              >
                {stripHtmlTags(course.summary)}
              </div>
            </div>
          )}
        </CCardBody>
     </CCard>

      {/* ─── Feature Comparison Table ─── */}
      <CCard>
        <CCardBody className="p-0">
           <div className="p-2 border-bottom">
              <h2 className="mb-0">
                {decodeURIComponent(courseName)} – Features
              </h2>
           </div>
          <div className="scroll-container">
            <table className="feature-table">
              <thead>
                <tr>
                  <th className="sticky-header">Feature</th>
                  {tracks.map((t) => (
                    <th key={t.id}>
                      <div className="d-flex flex-column align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <strong>{t.name}</strong>
                          <CTooltip content="Track Status">
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={t.is_active}
                                onChange={() =>
                                  confirmActionWrapper(
                                    () => toggleTrackStatus(t.id, t.is_active),
                                    t.is_active ? 'Deactivate Track' : 'Activate Track',
                                    `Are you sure you want to ${
                                      t.is_active ? 'deactivate' : 'activate'
                                    } <strong>${t.name}</strong>?`,
                                    t,
                                    'status',
                                  )
                                }
                              />
                              <span className="slider round" />
                            </label>
                          </CTooltip>
                          <CTooltip content="Edit Track">
                            <CIcon
                              icon={cilPen}
                              onClick={() => setEditTrackId(t.id)}
                              style={{ height: 16, width: 16, color: 'blue', cursor: 'pointer' }}
                            />
                          </CTooltip>
                          <CTooltip content="Delete Track">
                            <CIcon
                              icon={cilTrash}
                              onClick={() =>
                                confirmActionWrapper(
                                  () => deleteTrack(t.id),
                                  'Confirm Delete Track',
                                  `Are you sure you want to delete <strong>${t.name}</strong>?`
                                  
                                )
                              }
                              style={{ height: 16, width: 16, color: 'red', cursor: 'pointer' }}
                            />
                          </CTooltip>
                        </div>
                        <small className="text-muted">₹{t.fee}</small>
                      </div>
                    </th>
                  ))}
                  <th>
                    <CTooltip content="Add a track">
                      <button className="add-track-btn" onClick={() => setShowTrackModal(true)}>
                        + Add Track
                      </button>
                    </CTooltip>
                  </th>
                </tr>
              </thead>

              <tbody>
                {features.map((f) => (
                  <tr key={f.id} className="feature-row">
                    <td className="sticky-column">{f.name}</td>
                    {tracks.map((t) => (
                      <td key={t.id}>
                        <CTooltip content={getValue(t.id, f.id) || 'Empty'}>
                          <div>
                            <input
                              type="text"
                              value={getValue(t.id, f.id)}
                              className={`form-control ${
                                inputStatus[`${t.id}_${f.id}`] || ''
                              }`}
                              onChange={(e) => handleValueChange(t.id, f.id, e.target.value)}
                              disabled={editingFeatureId !== f.id}
                            />
                          </div>
                        </CTooltip>
                      </td>
                    ))}
                    <td>
                    <div className="d-flex justify-content-center gap-2">
                      {editingFeatureId === f.id ? (
                        <CTooltip content="Save">
                          <button
                            className="icon-btn save-btn"
                            onClick={() => {
                              handleUpdateValue(f.id);
                              setEditingFeatureId(null);
                            }}
                          >
                            Save
                          </button>
                        </CTooltip>
                      ) : (
                        <CTooltip content="Edit">
                          <button
                            className="icon-btn edit-btn"
                            onClick={() => setEditingFeatureId(f.id)}
                          >
                            <CIcon icon={cilPen} style={{ height: 18, width: 18 }} />
                          </button>
                        </CTooltip>
                      )}

                      <CTooltip content="Delete">
                        <button
                          className="icon-btn delete-btn"
                          onClick={() =>
                            confirmActionWrapper(
                              () => deleteFeature(f.id),
                              'Confirm Delete',
                              ` Are you sure you want to delete  <strong>${f.name} </strong>? Feature`,
                              f,
                            )
                          }
                        >
                          <CIcon icon={cilTrash} style={{ height: 18, width: 18 }} />
                        </button>
                      </CTooltip>
                    </div>
                  </td>

                  </tr>
                ))}

                {/* new feature row */}
                <tr>
                  <td>
                    <input
                      type="text"
                      placeholder="New feature name"
                      value={newFeature}
                      className={`form-control ${errors.newFeature ? 'is-invalid' : ''}`}
                      onChange={e => {
                        setNewFeature(e.target.value);
                        clearError('newFeature');
                      }}
                    />
                    {errors.newFeature && (
                      <div className="text-danger small mt-1">{errors.newFeature}</div>
                    )}
                  </td>

                  {/* one cell per track value */}
                  {tracks.map(t => (
                    <td key={t.id}>
                      <input
                        type="text"
                        placeholder={`Value for ${t.name}`}
                        value={newFeatureValues[t.id] || ''}
                        className={`form-control ${errors[`value_${t.id}`] ? 'is-invalid' : ''}`}
                        onChange={e => {
                          setNewFeatureValues(p => ({ ...p, [t.id]: e.target.value }));
                          clearError(`value_${t.id}`);
                        }}
                      />
                      {errors[`value_${t.id}`] && (
                        <div className="text-danger small mt-1">{errors[`value_${t.id}`]}</div>
                      )}
                    </td>
                            ))}
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={tracks.length + 2} className="sticky-footer">
                    <CTooltip content="Add feature">
                      <button className="add-feature-btn" onClick={handleAddFeature}>
                        Add Feature
                      </button>
                    </CTooltip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CCardBody>
      </CCard>

      {/* Modals */}
      {showTrackModal && (
        <CreateTrack
          courseId={courseId}
          onClose={() => setShowTrackModal(false)}
          onTrackAdded={fetchTracks}
        />
      )}
      {editTrackId && (
        <UpdateTrack
          trackId={editTrackId}
          onClose={() => setEditTrackId(null)}
          onTrackUpdated={fetchTracks}
        />
      )}
      {showConfirm && (
        <ConfirmDialog
          visible={showConfirm}
          title={confirmText.title}
          message={confirmText.message}
          onClose={() => {
            setShowConfirm(false);
            setSelectedItem(null);
          }}
          onConfirm={() => {
            confirmAction();
            setShowConfirm(false);
            setSelectedItem(null);
          }}
          confirmType={confirmType}
          isActive={confirmType === 'status' ? selectedItem?.is_active : false}
        />
      )}
    </CContainer>
  );
};

export default CourseDetail;
