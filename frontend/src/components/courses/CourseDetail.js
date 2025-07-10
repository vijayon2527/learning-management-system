import React, { useEffect, useState } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CButton,
  CTooltip,
  CModal,
  CModalHeader,
  CModalBody
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
  // const { courseId } = useParams();
  const { slug } = useParams();
  const [courseId, setCourseId] = useState(null);
  

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
  const [showFeatureForm, setShowFeatureForm] = useState(false);

  /* dialog / modal state */
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editTrackId, setEditTrackId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState({ title: '', message: '' });
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmType, setConfirmType] = useState('delete');
  const [selectedItem, setSelectedItem] = useState(null);
  const [courseName, setCourseName] = useState('');

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");


  /* ───────────────────────── Fetching ───────────────────────── */
 useEffect(() => {
  axiosInstance.get(`/api/courses/courses/${slug}/`)
    .then((res) => {
      setCourse(res.data);
      setCourseId(res.data.id); // ✅ Use this in other API calls
    })
    .catch((err) => {
      console.error('Failed to fetch course by slug', err);
    });
}, [slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchAll = async () => {
      try {
        // Course
        const courseRes = await axiosInstance.get(`/api/courses/courses/${slug}/`);
        setCourse(courseRes.data);
        setCourseId(courseRes.data.id);

        const courseId = courseRes.data.id;

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
  }, [slug]);

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
      toast.success('Feature deleted successfully');
    } catch {
      toast.error('Failed to delete feature');
    }
  };

 const fetchTracks = async () => {
  if (!courseId) return;
  const res = await axiosInstance.get(`/api/courses/tracks/?course_id=${courseId}`);
  setTracks(res.data);
};

const fetchFeatures = async () => {
  if (!courseId) return;
  const res = await axiosInstance.get(`/api/courses/features/?course_id=${courseId}`);
  setFeatures(res.data);
};

const fetchFeatureValues = async () => {
  if (!courseId) return;
  const res = await axiosInstance.get(`/api/courses/feature-values/?course_id=${courseId}`);
  setFeatureValues(res.data);
};

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
    const { data } = await axiosInstance.post('/api/courses/features/', {
      name: newFeature.trim(),
      order: features.length,
      course: courseId,
    });

    await Promise.all(
      Object.entries(newFeatureValues).map(([trackId, v]) =>
        axiosInstance.post('/api/courses/feature-values/', {
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
            style={{ gap: '2rem' }}
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
                {new Date(course.created_at).toLocaleDateString('en-GB')}
              </div>
            </div>

            <div>
              <span className="text-muted small">🟢 Enrollment</span>
              <div className="fw-semibold">
                {course.enrollment_open ? 'Open' : 'Closed'}
              </div>
            </div>

            <div>
              <span className="text-muted small">🌍 Visibility</span>
              <div className="fw-semibold text-capitalize">
                {course.visibility || '—'}
              </div>
            </div>

            <div>
              <span className="text-muted small">🎬 Promo Video</span>
              <div className="fw-semibold">
                {course.promotional_video ? (
                  <span
                    className="text-primary text-decoration-underline"
                    role="button"
                    onClick={() => {
                      setCurrentVideoUrl(course.promotional_video);
                      setVideoModalOpen(true);
                    }}
                  >
                    View Video
                  </span>
                ) : (
                  '—'
                )}

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
                {decodeURIComponent(slug)} – Features
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
                          <Link
                             to={`/dashboard/course-details/${slug}/track-section-list/${t.id}`}
                              className="fw-semibold text-primary text-decoration-none"
                            >
                              {t.name}
                            </Link>
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

              {!showFeatureForm && (
                <tr>
                  <td colSpan={tracks.length + 2} className="text-left py-3">
                    <CTooltip content="add new feature">
                    <CButton color="primary" onClick={() => setShowFeatureForm(true)}>
                      + Add Feature
                    </CButton>
                  </CTooltip>
                  </td>
                </tr>
              )}

              {showFeatureForm && (
                <>
                  <tr>
                    <td>
                      <input
                        type="text"
                        placeholder="New feature name"
                        value={newFeature}
                        className={`form-control ${errors.newFeature ? 'is-invalid' : ''}`}
                        onChange={(e) => {
                          setNewFeature(e.target.value);
                          clearError('newFeature');
                        }}
                      />
                      {errors.newFeature && (
                        <div className="text-danger small mt-1">{errors.newFeature}</div>
                      )}
                    </td>

                    {tracks.map((t) => (
                      <td key={t.id}>
                        <input
                          type="text"
                          placeholder={`Value for ${t.name}`}
                          value={newFeatureValues[t.id] || ''}
                          className={`form-control ${errors[`value_${t.id}`] ? 'is-invalid' : ''}`}
                          onChange={(e) => {
                            setNewFeatureValues((p) => ({ ...p, [t.id]: e.target.value }));
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
                      <CTooltip content="Submit">
                        <button
                          className="add-feature-btn"
                          onClick={() => {
                            handleAddFeature();
                            // Optional: Hide form again after submission
                            // setShowFeatureForm(false);
                          }}
                        >
                          Submit Feature
                        </button>
                      </CTooltip>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
            </table>
          </div>
        </CCardBody>
      </CCard>

      <CModal
        visible={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        backdrop="static"
        className="custom-video-modal"
      >
        <CModalHeader onClose={() => setVideoModalOpen(false)}>
          Promo Video
        </CModalHeader>

        <CModalBody
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ paddingBottom: '2rem' }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              height: '450px',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #3b82f6',
              boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
            }}
          >
            {currentVideoUrl.endsWith(".mp4") ? (
              <video controls style={{ width: "100%", height: "100%" }}>
                <source src={currentVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                src={currentVideoUrl}
                title="Promo Video"
                allowFullScreen
                frameBorder="0"
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>

          <div
            className="text-start mt-4 w-100 px-3"
            style={{ maxWidth: "900px", color: "#e5e5e5" }}
          >
            <h2 className="fw-bold mb-3" style={{ fontSize: "1.75rem" }}>
              {course.name}
            </h2>
            <p className="mb-0">
              <strong>Category:</strong> {course.category_name || '—'} &nbsp;|&nbsp;
              <strong>Duration:</strong> {course.estimated_duration || '—'}
            </p>
          </div>
        </CModalBody>
      </CModal>


      {/* Modals */}
      {showTrackModal && (
        <CreateTrack
          courseId={course.id}
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
