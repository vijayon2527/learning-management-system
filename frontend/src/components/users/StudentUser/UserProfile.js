
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import Header from '../../../pages/layout/partials/Header';
import Footer from '../../../pages/layout/partials/Footer';
import StudentSidebar from './StudentSidebar';
import { FaCamera } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { FaUserCircle } from 'react-icons/fa';

import './UserProfile.css';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    gender: '',
    date_of_birth: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    profile_pic: null,
    student: {
      education_level: '',
      institution: '',
      field_of_study: '',
      graduation_year: '',
      interests: '',
      goals: '',
    }
  });

  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [educationLevels, setEducationLevels] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/users/meta/')
      .then(res => setEducationLevels(res.data.education_levels))
      .catch(err => console.error('Failed to load choices', err));
  }, []);

  useEffect(() => {
    axiosInstance.get('/api/users/profile/')
      .then(res => setFormData(res.data))
      .catch(err => console.error(err));
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('student.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        student: {
          ...prev.student,
          [key]: value,
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setSelectedImage(file);
    }
  };

  const handleImageClick = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (key === 'student') {
      Object.entries(value).forEach(([sKey, sValue]) => {
        if (sKey === 'graduation_year' && sValue) {
          data.append(`student.${sKey}`, parseInt(sValue));
        } else if (sValue !== null && sValue !== '') {
          data.append(`student.${sKey}`, sValue);
        }
      });
    } else {
      if (key !== 'profile_pic' && value !== null && value !== '') {
        data.append(key, value);
      }
    }
  });

  if (selectedImage) {
    data.append('profile_pic', selectedImage);
  }

  try {
    await axiosInstance.put('/api/users/user/profile/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    toast.success('Profile updated successfully!');
  } catch (err) {
    if (err.response && err.response.data) {
      const errorData = err.response.data;

      // Loop through each error field
      Object.entries(errorData).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach(message => toast.error(`${field}: ${message}`));
        } else {
          toast.error(`${field}: ${messages}`);
        }
      });
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  }
};

  const getInitials = (name = '') =>
    name.trim().split(' ').filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join('');

  const getInitialsFromFullName = () =>
    getInitials(`${formData.first_name || ''} ${formData.last_name || ''}`);

  const getFullName = () =>
    `${formData.first_name || ''} ${formData.last_name || ''}`.trim();

  const imageSrc = preview || (formData.profile_pic ? `http://127.0.0.1:8000${formData.profile_pic}` : null);

  return (
    <>
      <Header />
      <div className="profile-container">
        <StudentSidebar initials={getInitialsFromFullName()} fullName={getFullName()} />

        <main className="form-section">
          <div className="profile-header-row">
            <h2>Edit Profile</h2>

           <div className="profile-pic-container" style={{ position: 'relative' }}>
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Profile"
                className="profile-pic"
                onClick={handleImageClick}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <FaUserCircle size={100} className="default-avatar-icon" />
            )}

            {/* Prevent camera icon click from propagating to image click */}
            <label
              htmlFor="profile-pic-upload"
              className="camera-overlay"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer' }}
            >
              <FaCamera />
            </label>
            <input
              type="file"
              id="profile-pic-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input name="mobile" value={formData.mobile} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PNS">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  name="student.graduation_year"
                  value={formData.student.graduation_year || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2 className="section-heading">Education Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Education Level</label>
                <select
                  name="student.education_level"
                  value={formData.student.education_level || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Education Level</option>
                  {educationLevels.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input name="student.institution" value={formData.student.institution || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Field of Study</label>
                <input name="student.field_of_study" value={formData.student.field_of_study || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Interests</label>
                <input name="student.interests" value={formData.student.interests || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Goals</label>
                <textarea name="student.goals" value={formData.student.goals || ''} onChange={handleChange} />
              </div>
            </div>

            <button type="submit">Save</button>
          </form>
        </main>
      </div>

      {/* Profile Popup Modal */}
      {showPopup && (
        <div className="profile-popup-overlay" onClick={handleClosePopup}>
          <div className="profile-popup-content" onClick={(e) => e.stopPropagation()}>
            <img src={imageSrc} alt="Enlarged Profile" className="popup-profile-img" />
            <button className="close-btn" onClick={handleClosePopup}>×</button>
          </div>
        </div>
      )}

      <Footer />
      <ToastContainer />
    </>
  );
};

export default UserProfile;
