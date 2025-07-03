







// // FeatureComparison.js – FULL FILE WITH VALUE‑VALIDATION ADDED
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../../utils/axiosInstance';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import CreateTrack from './CreateTrack';
// import ConfirmDialog from './ConfirmDialog';
// import UpdateTrack from './UpdateTrack';
// import CIcon from '@coreui/icons-react';
// import { cilPen, cilTrash } from '@coreui/icons';
// import { CTooltip } from '@coreui/react';

// const FeatureComparison = () => {
//   const { courseId, courseName } = useParams();
//   const navigate = useNavigate();

//   const [tracks, setTracks] = useState([]);
//   const [features, setFeatures] = useState([]);
//   const [featureValues, setFeatureValues] = useState([]);
//   const [newFeature, setNewFeature] = useState('');
//   const [newFeatureValues, setNewFeatureValues] = useState({});
//   const [showTrackModal, setShowTrackModal] = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null);
//   const [confirmText, setConfirmText] = useState({ title: '', message: '' });
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [editTrackId, setEditTrackId] = useState(null);
//   const [selectedTrack, setSelectedTrack] = useState(null);
//   const [confirmType, setConfirmType] = useState('delete');
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [inputStatus, setInputStatus] = useState({});
//   const [newFeatureInputStatus, setNewFeatureInputStatus] = useState({});
//   const [editingFeatureId, setEditingFeatureId] = useState(null);

//   // ───────────────────────────────────────────── Fetch data ─┐
//   useEffect(() => {
//     if (!courseId) return;
//     fetchTracks();
//     fetchFeatures();
//     fetchFeatureValues();
//   }, [courseId]);

//   const fetchTracks = async () => {
//     const res = await axiosInstance.get(`/api/tracks/?course_id=${courseId}`);
//     setTracks(res.data);
//   };
//   const fetchFeatures = async () => {
//     const res = await axiosInstance.get(`/api/features/?course_id=${courseId}`);
//     setFeatures(res.data);
//   };
//   const fetchFeatureValues = async () => {
//     const res = await axiosInstance.get(`/api/feature-values/?course_id=${courseId}`);
//     setFeatureValues(res.data);
//   };
//   // ───────────────────────────────────────────── Helpers ─────┘

//   const getValue = (trackId, featureId) => {
//     const item = featureValues.find(
//       (fv) => fv.track.id === trackId && fv.feature.id === featureId
//     );
//     return item ? item.value || '' : '';
//   };
//   const getValueId = (trackId, featureId) => {
//     const item = featureValues.find(
//       (fv) => fv.track.id === trackId && fv.feature.id === featureId
//     );
//     return item ? item.id : null;
//   };

//   // ───────────────────────────────────────────── Handlers ─────
//   const handleValueChange = (trackId, featureId, value) => {
//     const existing = featureValues.find(
//       (fv) => fv.track.id === trackId && fv.feature.id === featureId
//     );
//     if (existing) {
//       setFeatureValues((prev) =>
//         prev.map((fv) =>
//           fv.track.id === trackId && fv.feature.id === featureId ? { ...fv, value } : fv
//         )
//       );
//     } else {
//       setFeatureValues((prev) => [
//         ...prev,
//         { id: null, track: { id: trackId }, feature: { id: featureId }, value },
//       ]);
//     }

//     const key = `${trackId}_${featureId}`;
//     setInputStatus((prev) => ({ ...prev, [key]: value.trim() !== '' ? 'is-valid' : '' }));
//   };

//   const handleUpdateValue = async (featureId) => {
//     try {
//       const updatePromises = tracks.map(async (track) => {
//         const id = getValueId(track.id, featureId);
//         const value = getValue(track.id, featureId);
//         if (id) {
//           return axiosInstance.put(`/api/feature-values/${id}/`, { id, track: track.id, feature: featureId, value });
//         }
//         return axiosInstance.post(`/api/feature-values/`, { track: track.id, feature: featureId, value });
//       });
//       await Promise.all(updatePromises);
//       fetchFeatureValues();
//       toast.success('Feature values saved successfully!');
//     } catch {
//       toast.error('Failed to save feature values.');
//     }
//   };

//   const deleteFeature = async (featureId) => {
//     try {
//       await axiosInstance.delete(`/api/features/${featureId}/`);
//       fetchFeatures();
//       fetchFeatureValues();
//       toast.success('Feature deleted successfully!');
//     } catch {
//       toast.error('Failed to delete feature.');
//     }
//   };
//   const handleDeleteTrack = async (trackId) => {
//     try {
//       await axiosInstance.delete(`/api/tracks/${trackId}/`);
//       fetchTracks();
//       toast.success('Track deleted successfully!');
//     } catch {
//       toast.error('Failed to delete track.');
//     }
//   };
//   const toggleTrackStatus = async (trackId, currentStatus) => {
//     try {
//       const newStatus = !currentStatus;
//       await axiosInstance.patch(`/api/tracks/${trackId}/`, { is_active: newStatus });
//       fetchTracks();
//       toast.success(newStatus ? 'Track activated' : 'Track deactivated');
//     } catch {
//       toast.error('Failed to update track status');
//     }
//   };

//   // ─────────────────────────────────── Add feature w/ validation ─
//   const handleAddFeature = async () => {
//     const validationErrors = {};

//     if (!newFeature.trim()) {
//       validationErrors.newFeature = 'Feature name is required.';
//     }

//     // Validate every track value
//     tracks.forEach((track) => {
//       const value = newFeatureValues[track.id];
//       if (!value || !value.trim()) {
//         validationErrors[`value_${track.id}`] = `Value required for ${track.name}`;
//         setNewFeatureInputStatus((prev) => ({ ...prev, [track.id]: 'is-invalid' }));
//       }
//     });

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setErrors({});
//     try {
//       const res = await axiosInstance.post(`/api/features/`, {
//         name: newFeature,
//         order: features.length,
//         course: courseId,
//       });
//       const featureId = res.data.id;

//       const createPromises = Object.entries(newFeatureValues).map(([trackId, value]) =>
//         axiosInstance.post(`/api/feature-values/`, { track: parseInt(trackId), feature: featureId, value })
//       );
//       await Promise.all(createPromises);

//       // reset
//       setNewFeature('');
//       setNewFeatureValues({});
//       setNewFeatureInputStatus({});
//       fetchFeatures();
//       fetchFeatureValues();
//       toast.success('Feature and values added successfully!');
//     } catch {
//       toast.error('Failed to add feature.');
//     }
//   };

//   // ───────────────────────────────────────────── Confirm helpers ─
//   const confirmDeleteFeature = (featureId, featureName) => {
//     const feature = features.find((f) => f.id === featureId);
//     setSelectedItem(feature);
//     setConfirmType('delete');
//     setConfirmText({
//       title: 'Delete Feature',
//       message: `Are you sure you want to delete the feature <strong>${featureName}</strong> and all its values?`,
//     });
//     setConfirmAction(() => () => deleteFeature(featureId));
//     setShowConfirm(true);
//   };
//   const confirmToggleTrackStatus = (trackId, isActive) => {
//     const track = tracks.find((t) => t.id === trackId);
//     setSelectedItem(track);
//     setConfirmType('status');
//     setConfirmText({
//       title: isActive ? 'Deactivate Track' : 'Activate Track',
//       message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} track <strong>${track?.name}</strong>?`,
//     });
//     setConfirmAction(() => () => toggleTrackStatus(trackId, isActive));
//     setShowConfirm(true);
//   };
//   const confirmDeleteTrack = (trackId, trackName) => {
//     const track = tracks.find((t) => t.id === trackId);
//     setSelectedItem(track);
//     setConfirmType('delete');
//     setConfirmText({
//       title: 'Delete Track',
//       message: `Are you sure you want to permanently delete the track <strong>${trackName}</strong>?`,
//     });
//     setConfirmAction(() => () => handleDeleteTrack(trackId));
//     setShowConfirm(true);
//   };

//   // ───────────────────────────────────────────── New‑value input ─
//   const handleNewFeatureValueChange = (trackId, value) => {
//     setNewFeatureValues((prev) => ({ ...prev, [trackId]: value }));
//     setNewFeatureInputStatus((prev) => ({ ...prev, [trackId]: value.trim() !== '' ? 'is-valid' : 'is-invalid' }));

//     // clear per‑track error if user starts typing
//     if (errors[`value_${trackId}`]) {
//       setErrors((prev) => {
//         const copy = { ...prev };
//         delete copy[`value_${trackId}`];
//         return copy;
//       });
//     }
//   };

//   // ───────────────────────────────────────────── JSX ────────────
//   return (
//     <div className="feature-container">
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* Header bar */}
//       <div className="header-bar">
//         <h2>{decodeURIComponent(courseName)} – Course Structure & Feature Mapping</h2>
//         <button onClick={() => navigate(`/dashboard/course-details/${courseId}`)} className="back-button">← Back</button>
//       </div>

//       {/* Table wrapper */}
//       <div className="scroll-container">
//         <table className="feature-table">
//           <thead>
//             <tr>
//               <th className="sticky-header">Feature</th>
//               {tracks.map((track) => (
//                 <th key={track.id}>
//                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                       <strong>{track.name}</strong>
//                       {/* Track status */}
//                       <CTooltip content="Track status" placement="top">
//                         <label className="switch">
//                           <input type="checkbox" checked={track.is_active} onChange={() => confirmToggleTrackStatus(track.id, track.is_active)} />
//                           <span className="slider round" />
//                         </label>
//                       </CTooltip>
//                       {/* Edit Track */}
//                       <CTooltip content="Edit Track" placement="top">
//                         <CIcon icon={cilPen} onClick={() => setEditTrackId(track.id)} style={{ height: 16, width: 16, color: 'blue', cursor: 'pointer' }} />
//                       </CTooltip>
//                       {/* Delete Track */}
//                       <CTooltip content="Delete Track" placement="top">
//                         <CIcon icon={cilTrash} onClick={() => confirmDeleteTrack(track.id, track.name)} style={{ height: 16, width: 16, color: 'red', cursor: 'pointer' }} />
//                       </CTooltip>
//                     </div>
//                     <small style={{ color: '#555' }}>₹{track.fee}</small>
//                   </div>
//                 </th>
//               ))}
//               <th>
//                 <CTooltip content="Add a new track" placement="top">
//                   <button className="add-track-btn" onClick={() => setShowTrackModal(true)}>+ Add Track</button>
//                 </CTooltip>
//               </th>
//             </tr>
//           </thead>

//           <tbody>
//             {/* Existing feature rows */}
//             {features.map((feature) => (
//               <tr key={feature.id}>
//                 <td className="sticky-column">{feature.name}</td>
//                 {tracks.map((track) => (
//                   <td key={track.id}>
//                     <div className="tooltip-container">
//                       <CTooltip content={getValue(track.id, feature.id) || 'Empty'} placement="top">
//                         <input type="text" value={getValue(track.id, feature.id)} className={`form-control ${inputStatus[`${track.id}_${feature.id}`] || ''}`} onChange={(e) => handleValueChange(track.id, feature.id, e.target.value)} disabled={editingFeatureId !== feature.id} />
//                       </CTooltip>
//                       <div className="tooltip-text">{getValue(track.id, feature.id) || 'Empty'}</div>
//                     </div>
//                   </td>
//                 ))}

//                <td>
//                 <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
//                   {editingFeatureId === feature.id ? (
//                     <div className="tooltip-container">
//                       <button
//                         className="icon-btn save-btn"
//                         onClick={() => {
//                           handleUpdateValue(feature.id);
//                           setEditingFeatureId(null);
//                         }}
//                       >
//                         Save
//                       </button>
//                       <div className="tooltip-text">Save</div>
//                     </div>
//                   ) : (
//                     <div className="tooltip-container">
//                       <button
//                         className="icon-btn edit-btn"
//                         onClick={() => setEditingFeatureId(feature.id)}
//                       >
//                         <CIcon icon={cilPen} style={{ height: 18, width: 18 }} />
//                       </button>
//                       <div className="tooltip-text">Edit</div>
//                     </div>
//                   )}

//                   <div className="tooltip-container">
//                     <button
//                       className="icon-btn delete-btn"
//                       onClick={() => confirmDeleteFeature(feature.id, feature.name)}
//                     >
//                       <CIcon icon={cilTrash} style={{ height: 18, width: 18 }} />
//                     </button>
//                     <div className="tooltip-text">Delete</div>
//                   </div>
//                 </div>
//               </td>
//               </tr>
//             ))}
//             <tr>
//               <td>
//               <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <input
//                   type="text"
//                   placeholder="Enter new feature name"
//                   className={`form-control ${errors.newFeature ? 'is-invalid' : ''}`}
//                   value={newFeature}
//                   onChange={(e) => {
//                     setNewFeature(e.target.value);
//                     setErrors((prev) => ({ ...prev, newFeature: '' }));
//                   }}
//                 />
//                 {errors.newFeature && (
//                   <div className="text-danger" style={{ fontSize: '13px', marginTop: '4px' }}>
//                     {errors.newFeature}
//                   </div>
//                 )}
//               </div>
//               </td>
//               {tracks.map((track) => (
//                 <td key={track.id}>
//                   <input
//                     type="text"
//                     placeholder={`Value for ${track.name}`}
//                     value={newFeatureValues[track.id] || ''}
//                     onChange={(e) => handleNewFeatureValueChange(track.id, e.target.value)}
//                     className={`form-control ${newFeatureInputStatus[track.id] || ''}`}
//                   />

//                   {errors[`value_${track.id}`] && (
//                     <div className="text-danger" style={{ fontSize: '13px', marginTop: '4px' }}>
//                       {errors[`value_${track.id}`]}
//                     </div>
//                   )}

//                 </td>
//               ))}
//               <td></td>
//             </tr>
//             <tr>
//               <td colSpan={tracks.length + 2} className="sticky-footer">
//                 <button className="add-feature-btn" onClick={handleAddFeature}>
//                   Add Feature
//                 </button>
//               </td>
//             </tr>

//           </tbody>
//         </table>
//       </div>

//       {showTrackModal && (
//         <CreateTrack
//           courseId={courseId}
//           onClose={() => setShowTrackModal(false)}
//           onTrackAdded={fetchTracks}
//         />
//       )}

//       {editTrackId && (
//         <UpdateTrack
//           trackId={editTrackId}
//           onClose={() => setEditTrackId(null)}
//           onTrackUpdated={fetchTracks}
//         />
//       )}

//      {showConfirm && (
//       <ConfirmDialog
//         visible={showConfirm}
//         title={confirmText.title}
//         message={confirmText.message}
//         onClose={() => {
//           setShowConfirm(false);
//           setSelectedItem(null);
//         }}
//         onConfirm={() => {
//           confirmAction();
//           setShowConfirm(false);
//           setSelectedItem(null);
//         }}
//         confirmType={confirmType}
//         isActive={confirmType === "status" ? selectedItem?.is_active : false}
//       />
//     )}

//     </div>
//   );
// };

// export default FeatureComparison;






import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateTrack from './CreateTrack';
import ConfirmDialog from './ConfirmDialog';
import UpdateTrack from './UpdateTrack';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import {
  CContainer,
  CButton,
  CCard,
  CCardBody,
  CTooltip
} from '@coreui/react';

const FeatureComparison = () => {
  const { courseId, courseName } = useParams();
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [newFeatureValues, setNewFeatureValues] = useState({});
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmText, setConfirmText] = useState({ title: '', message: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [editTrackId, setEditTrackId] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [confirmType, setConfirmType] = useState('delete');
  const [selectedItem, setSelectedItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [inputStatus, setInputStatus] = useState({});
  const [newFeatureInputStatus, setNewFeatureInputStatus] = useState({});
  const [editingFeatureId, setEditingFeatureId] = useState(null);

  // ───────────────────────────────────────────── Fetch data ─┐
  useEffect(() => {
    if (!courseId) return;
    fetchTracks();
    fetchFeatures();
    fetchFeatureValues();
  }, [courseId]);

  const fetchTracks = async () => {
    const res = await axiosInstance.get(`/api/tracks/?course_id=${courseId}`);
    setTracks(res.data);
  };
  const fetchFeatures = async () => {
    const res = await axiosInstance.get(`/api/features/?course_id=${courseId}`);
    setFeatures(res.data);
  };
  const fetchFeatureValues = async () => {
    const res = await axiosInstance.get(`/api/feature-values/?course_id=${courseId}`);
    setFeatureValues(res.data);
  };
  // ───────────────────────────────────────────── Helpers ─────┘

  const getValue = (trackId, featureId) => {
    const item = featureValues.find(
      (fv) => fv.track.id === trackId && fv.feature.id === featureId
    );
    return item ? item.value || '' : '';
  };
  const getValueId = (trackId, featureId) => {
    const item = featureValues.find(
      (fv) => fv.track.id === trackId && fv.feature.id === featureId
    );
    return item ? item.id : null;
  };

  // ───────────────────────────────────────────── Handlers ─────
  const handleValueChange = (trackId, featureId, value) => {
    const existing = featureValues.find(
      (fv) => fv.track.id === trackId && fv.feature.id === featureId
    );
    if (existing) {
      setFeatureValues((prev) =>
        prev.map((fv) =>
          fv.track.id === trackId && fv.feature.id === featureId ? { ...fv, value } : fv
        )
      );
    } else {
      setFeatureValues((prev) => [
        ...prev,
        { id: null, track: { id: trackId }, feature: { id: featureId }, value },
      ]);
    }

    const key = `${trackId}_${featureId}`;
    setInputStatus((prev) => ({ ...prev, [key]: value.trim() !== '' ? 'is-valid' : '' }));
  };

  const handleUpdateValue = async (featureId) => {
    try {
      const updatePromises = tracks.map(async (track) => {
        const id = getValueId(track.id, featureId);
        const value = getValue(track.id, featureId);
        if (id) {
          return axiosInstance.put(`/api/feature-values/${id}/`, { id, track: track.id, feature: featureId, value });
        }
        return axiosInstance.post(`/api/feature-values/`, { track: track.id, feature: featureId, value });
      });
      await Promise.all(updatePromises);
      fetchFeatureValues();
      toast.success('Feature values saved successfully!');
    } catch {
      toast.error('Failed to save feature values.');
    }
  };

  const deleteFeature = async (featureId) => {
    try {
      await axiosInstance.delete(`/api/features/${featureId}/`);
      fetchFeatures();
      fetchFeatureValues();
      toast.success('Feature deleted successfully!');
    } catch {
      toast.error('Failed to delete feature.');
    }
  };
  const handleDeleteTrack = async (trackId) => {
    try {
      await axiosInstance.delete(`/api/tracks/${trackId}/`);
      fetchTracks();
      toast.success('Track deleted successfully!');
    } catch {
      toast.error('Failed to delete track.');
    }
  };
  const toggleTrackStatus = async (trackId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosInstance.patch(`/api/tracks/${trackId}/`, { is_active: newStatus });
      fetchTracks();
      toast.success(newStatus ? 'Track activated' : 'Track deactivated');
    } catch {
      toast.error('Failed to update track status');
    }
  };

  // ─────────────────────────────────── Add feature w/ validation ─
  const handleAddFeature = async () => {
    const validationErrors = {};

    if (!newFeature.trim()) {
      validationErrors.newFeature = 'Feature name is required.';
    }

    // Validate every track value
    tracks.forEach((track) => {
      const value = newFeatureValues[track.id];
      if (!value || !value.trim()) {
        validationErrors[`value_${track.id}`] = `Value required for ${track.name}`;
        setNewFeatureInputStatus((prev) => ({ ...prev, [track.id]: 'is-invalid' }));
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    try {
      const res = await axiosInstance.post(`/api/features/`, {
        name: newFeature,
        order: features.length,
        course: courseId,
      });
      const featureId = res.data.id;

      const createPromises = Object.entries(newFeatureValues).map(([trackId, value]) =>
        axiosInstance.post(`/api/feature-values/`, { track: parseInt(trackId), feature: featureId, value })
      );
      await Promise.all(createPromises);

      // reset
      setNewFeature('');
      setNewFeatureValues({});
      setNewFeatureInputStatus({});
      fetchFeatures();
      fetchFeatureValues();
      toast.success('Feature and values added successfully!');
    } catch {
      toast.error('Failed to add feature.');
    }
  };

  // ───────────────────────────────────────────── Confirm helpers ─
  const confirmDeleteFeature = (featureId, featureName) => {
    const feature = features.find((f) => f.id === featureId);
    setSelectedItem(feature);
    setConfirmType('delete');
    setConfirmText({
      title: 'Delete Feature',
      message: `Are you sure you want to delete the feature <strong>${featureName}</strong> and all its values?`,
    });
    setConfirmAction(() => () => deleteFeature(featureId));
    setShowConfirm(true);
  };
  const confirmToggleTrackStatus = (trackId, isActive) => {
    const track = tracks.find((t) => t.id === trackId);
    setSelectedItem(track);
    setConfirmType('status');
    setConfirmText({
      title: isActive ? 'Deactivate Track' : 'Activate Track',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} track <strong>${track?.name}</strong>?`,
    });
    setConfirmAction(() => () => toggleTrackStatus(trackId, isActive));
    setShowConfirm(true);
  };
  const confirmDeleteTrack = (trackId, trackName) => {
    const track = tracks.find((t) => t.id === trackId);
    setSelectedItem(track);
    setConfirmType('delete');
    setConfirmText({
      title: 'Delete Track',
      message: `Are you sure you want to permanently delete the track <strong>${trackName}</strong>?`,
    });
    setConfirmAction(() => () => handleDeleteTrack(trackId));
    setShowConfirm(true);
  };

  // ───────────────────────────────────────────── New‑value input ─
  const handleNewFeatureValueChange = (trackId, value) => {
    setNewFeatureValues((prev) => ({ ...prev, [trackId]: value }));
    setNewFeatureInputStatus((prev) => ({ ...prev, [trackId]: value.trim() !== '' ? 'is-valid' : 'is-invalid' }));

    // clear per‑track error if user starts typing
    if (errors[`value_${trackId}`]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`value_${trackId}`];
        return copy;
      });
    }
  };

 // ───────────────────────────────────────────── JSX ────────────
return (
  <CContainer fluid className="p-2 bg-light">
    <ToastContainer position="top-right" autoClose={3000} />

    {/* Header bar – identical style */}
    <div className="d-flex justify-content-between align-items-center mb-4 px-1">
      <h2 className="mb-1">
        {decodeURIComponent(courseName)} – Feature Comparison
      </h2>

      <CTooltip content="Go Back">
        <CButton
          color="light"
          className="text-dark border border-secondary"
          onClick={() => navigate(`/dashboard/course-details/${courseId}`)}
          style={{
            fontWeight: 600,
            borderRadius: '2rem',
            padding: '0.45rem 1.2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          ← Back
        </CButton>
      </CTooltip>
    </div>

    {/* Card wrapper – keeps padding & shadow consistent */}
    <CCard className="">
      <CCardBody className="p-0">

        {/* Scrollable comparison table */}
        <div className="scroll-container">
          <table className="feature-table">
            {/* ─── THEAD ─── */}
            <thead>
              <tr>
                <th className="sticky-header">Feature</th>
                {tracks.map((track) => (
                  <th key={track.id}>
                    <div className="d-flex flex-column align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <strong>{track.name}</strong>

                        {/* Status toggle */}
                        <CTooltip content="Track status">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={track.is_active}
                              onChange={() =>
                                confirmToggleTrackStatus(track.id, track.is_active)
                              }
                            />
                            <span className="slider round" />
                          </label>
                        </CTooltip>

                        {/* Edit / Delete icons */}
                        <CTooltip content="Edit Track">
                          <CIcon
                            icon={cilPen}
                            onClick={() => setEditTrackId(track.id)}
                            style={{ height: 16, width: 16, color: 'blue', cursor: 'pointer' }}
                          />
                        </CTooltip>
                        <CTooltip content="Delete Track">
                          <CIcon
                            icon={cilTrash}
                            onClick={() => confirmDeleteTrack(track.id, track.name)}
                            style={{ height: 16, width: 16, color: 'red', cursor: 'pointer' }}
                          />
                        </CTooltip>
                      </div>
                      <small className="text-muted">₹{track.fee}</small>
                    </div>
                  </th>
                ))}
                <th>
                  <CTooltip content="Add a new track">
                    <button
                      className="add-track-btn"
                      onClick={() => setShowTrackModal(true)}
                    >
                      + Add Track
                    </button>
                  </CTooltip>
                </th>
              </tr>
            </thead>

            {/* ─── TBODY ─── */}
            <tbody>
              {/* Existing feature rows */}
              {features.map((feature) => (
                <tr key={feature.id}  className="feature-row">
                  <td className="sticky-column">{feature.name}</td>

                  {tracks.map((track) => (
                    <td key={track.id}>
                      <CTooltip content={getValue(track.id, feature.id) || 'Empty'} placement="top">
                        <div>
                          <input
                            type="text"
                            value={getValue(track.id, feature.id)}
                            className={`form-control ${inputStatus[`${track.id}_${feature.id}`] || ''}`}
                            onChange={(e) => handleValueChange(track.id, feature.id, e.target.value)}
                            disabled={editingFeatureId !== feature.id}
                          />
                        </div>
                      </CTooltip>
                    </td>
                  ))}

                  {/* Row actions */}
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    {editingFeatureId === feature.id ? (
                      <CTooltip content="Save" placement="top">
                        <button
                          className="icon-btn save-btn"
                          onClick={() => {
                            handleUpdateValue(feature.id);
                            setEditingFeatureId(null);
                          }}
                        >
                          Save
                        </button>
                      </CTooltip>
                    ) : (
                      <CTooltip content="Edit" placement="top">
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => setEditingFeatureId(feature.id)}
                        >
                          <CIcon icon={cilPen} style={{ height: 18, width: 18 }} />
                        </button>
                      </CTooltip>
                    )}

                    <CTooltip content="Delete" placement="top">
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => confirmDeleteFeature(feature.id, feature.name)}
                      >
                        <CIcon icon={cilTrash} style={{ height: 18, width: 18 }} />
                      </button>
                    </CTooltip>
                  </div>
                </td>

                </tr>
              ))}

              {/* New‑feature input row */}
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="Enter new feature name"
                    className={`form-control ${errors.newFeature ? 'is-invalid' : ''}`}
                    value={newFeature}
                    onChange={(e) => {
                      setNewFeature(e.target.value);
                      setErrors((prev) => ({ ...prev, newFeature: '' }));
                    }}
                  />
                  {errors.newFeature && (
                    <div className="text-danger small mt-1">{errors.newFeature}</div>
                  )}
                </td>

                {tracks.map((track) => (
                  <td key={track.id}>
                    <input
                      type="text"
                      placeholder={`Value for ${track.name}`}
                      value={newFeatureValues[track.id] || ''}
                      onChange={(e) =>
                        handleNewFeatureValueChange(track.id, e.target.value)
                      }
                      className={`form-control ${newFeatureInputStatus[track.id] || ''}`}
                    />
                    {errors[`value_${track.id}`] && (
                      <div className="text-danger small mt-1">
                        {errors[`value_${track.id}`]}
                      </div>
                    )}
                  </td>
                ))}

                <td></td>
              </tr>

              {/* Add‑feature button row */}
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

    {/* Modals & dialogs (unchanged) */}
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

export default FeatureComparison;
