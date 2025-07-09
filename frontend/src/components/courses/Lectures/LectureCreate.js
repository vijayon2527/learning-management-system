// // src/components/sections/Sections/CreateLecture.js
// import React, { useEffect, useState } from 'react';
// import DatePicker from 'react-datepicker';
// import {
//   CModal, CModalHeader, CModalBody, CModalFooter,
//   CButton, CSpinner, CForm, CFormInput, CFormCheck,
//   CFormSelect,
// } from '@coreui/react';
// import axiosInstance from '../../../utils/axiosInstance';
// import { toast } from 'react-toastify';

// const CreateLecture = ({ visible, sectionId, onClose, onCreated }) => {
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({
//     name: '',
//     video: null,
//     is_preview: false,
//     is_locked: false,
//     release_date: null,
//     prerequisites: [],
//   });
//   const [allLectures, setAllLectures] = useState([]);

//   /* fetch existing lectures for prerequisite list */
//   useEffect(() => {
//     if (!visible) return;
//     (async () => {
//       try {
//         const { data } = await axiosInstance.get(
//           `/api/courses/lectures/?section_id=${sectionId}`
//         );
//         setAllLectures(data);
//       } catch {
//         setAllLectures([]);
//       }
//     })();
//   }, [visible, sectionId]);

//   const update = (e) => {
//     const { name, value, type, checked, options } = e.target;
//     if (type === 'checkbox') {
//       setForm((p) => ({ ...p, [name]: checked }));
//     } else if (options) {
//       // multiselect
//       const vals = Array.from(options)
//         .filter((o) => o.selected)
//         .map((o) => Number(o.value));
//       setForm((p) => ({ ...p, prerequisites: vals }));
//     } else {
//       setForm((p) => ({ ...p, [name]: value }));
//     }
//   };

//   const pickFile = (e) => setForm((p) => ({ ...p, video: e.target.files[0] }));

//   const reset = () =>
//     setForm({
//       name: '',
//       video: null,
//       is_preview: false,
//       is_locked: false,
//       release_date: null,
//       prerequisites: [],
//     });

//   const close = () => {
//     reset();
//     onClose();
//   };

//   const save = async () => {
//     if (!form.name.trim() || !form.video) {
//       toast.error('Name and video are required');
//       return;
//     }

//     setSaving(true);
//     const fd = new FormData();
//     fd.append('section',        sectionId);
//     fd.append('name',           form.name);
//     fd.append('video',          form.video);
//     fd.append('is_preview',     form.is_preview);
//     fd.append('is_locked',      form.is_locked);
//     if (form.release_date)
//       fd.append('release_date', form.release_date.toISOString());
//     form.prerequisites.forEach((id) => fd.append('prerequisites', id));

//     try {
//       const { data } = await axiosInstance.post('/api/courses/lectures/', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       toast.success('Lecture created');
//       onCreated(data);
//       close();
//     } catch (err) {
//       console.error(err.response?.data || err);
//       toast.error('Failed to create lecture');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <CModal visible={visible} backdrop="static" keyboard={false}>
//       <CForm onSubmit={(e) => { e.preventDefault(); save(); }}>
//         <CModalHeader onClose={close}>Add Lecture</CModalHeader>
//         <CModalBody>

//           {/* name */}
//           <CFormInput
//             label="Lecture Name"
//             name="name"
//             value={form.name}
//             onChange={update}
//             required
//             className="mb-3"
//           />

//           {/* video */}
//           <CFormInput
//             type="file"
//             accept="video/*"
//             label="Video"
//             onChange={pickFile}
//             required
//             className="mb-3"
//           />

//           {/* release date */}
//           <div className="mb-3">
//             <label className="form-label">Release Date</label>
//             <DatePicker
//               selected={form.release_date}
//               onChange={(date) => setForm({ ...form, release_date: date })}
//               dateFormat="yyyy-MM-dd HH:mm"
//               showTimeSelect
//               className="form-control"
//               placeholderText="Select release date and time"
//             />
//           </div>
//           {/* preview / locked */}
//           <CFormCheck
//             label="Previewable (free)"
//             name="is_preview"
//             checked={form.is_preview}
//             onChange={update}
//             className="mb-2"
//           />
//           <CFormCheck
//             label="Locked until enrolled"
//             name="is_locked"
//             checked={form.is_locked}
//             onChange={update}
//             className="mb-3"
//           />

//           {/* prerequisites */}
//           {allLectures.length > 0 && (
//             <CFormSelect
//               label="Prerequisite Lectures"
//               multiple
//               size={5}
//               value={form.prerequisites.map(String)}
//               onChange={update}
//               name="prerequisites"
//               className="mb-3"
//             >
//               {allLectures.map((l) => (
//                 <option key={l.id} value={l.id}>
//                   {l.name}
//                 </option>
//               ))}
//             </CFormSelect>
//           )}
//         </CModalBody>

//         <CModalFooter>
//           <CButton color="secondary" variant="outline" onClick={close}>
//             Cancel
//           </CButton>
//           <CButton type="submit" color="primary" disabled={saving}>
//             {saving ? <CSpinner size="sm" /> : 'Save'}
//           </CButton>
//         </CModalFooter>
//       </CForm>
//     </CModal>
//   );
// };

// export default CreateLecture;




// src/components/sections/Sections/CreateLecture.js
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  CModal, CModalHeader, CModalBody, CModalFooter,
  CButton, CSpinner, CForm, CFormInput, CFormCheck
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';

const CreateLecture = ({ visible, sectionId, onClose, onCreated }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    video: null,
    is_preview: false,
    is_locked: false,
    release_date: null,
  });

  const [errors, setErrors] = useState({
    name: '',
    video: '',
  });

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const pickFile = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, video: file }));
    setErrors((prev) => ({ ...prev, video: '' }));
  };

  const reset = () => {
    setForm({
      name: '',
      video: null,
      is_preview: false,
      is_locked: false,
      release_date: null,
    });
    setErrors({ name: '', video: '' });
  };

  const close = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Lecture name is required.';
    if (!form.video) newErrors.video = 'Video file is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    const fd = new FormData();
    fd.append('section', sectionId);
    fd.append('name', form.name);
    fd.append('video', form.video);
    fd.append('is_preview', form.is_preview);
    fd.append('is_locked', form.is_locked);
    if (form.release_date)
      fd.append('release_date', form.release_date.toISOString());

    try {
      const { data } = await axiosInstance.post('/api/courses/lectures/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Lecture created successfully');
      onCreated(data);
      close();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error('Failed to create lecture');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CModal visible={visible} backdrop="static" keyboard={false}>
      <CForm onSubmit={(e) => { e.preventDefault(); save(); }}>
        <CModalHeader onClose={close}>Add Lecture</CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormInput
              label="Lecture Name"
              name="name"
              value={form.name}
              onChange={update}
              placeholder="Enter lecture title"
              invalid={!!errors.name}
            />
            {errors.name && (
              <div className="text-danger small mt-1">{errors.name}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Video</label>
            <CFormInput
              type="file"
              accept="video/*"
              onChange={pickFile}
              invalid={!!errors.video}
            />
            {errors.video && (
              <div className="text-danger small mt-1">{errors.video}</div>
            )}
          </div>

          <div className="mb-3 d-flex flex-column">
            <label className="form-label mb-1">Release Date</label>
            <DatePicker
              selected={form.release_date}
              onChange={(date) => setForm({ ...form, release_date: date })}
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
            onChange={update}
            className="mb-2"
          />

          <CFormCheck
            label="Locked until enrolled"
            name="is_locked"
            checked={form.is_locked}
            onChange={update}
            className="mb-3"
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={close}>
            Cancel
          </CButton>
          <CButton type="submit" color="success" disabled={saving}>
            {saving ? <CSpinner size="sm" /> : 'Create Lecture'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  );
};

export default CreateLecture;
