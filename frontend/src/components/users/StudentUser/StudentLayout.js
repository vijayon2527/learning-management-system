// src/layouts/StudentLayout.js
import React, { useEffect, useState } from 'react';
import StudentSidebar from './StudentSidebar';
import Header from '../../../pages/layout/partials/Header';
import Footer from '../../../pages/layout/partials/Footer';
import axiosInstance from '../../../utils/axiosInstance';
import './StudentLayout.css';

const StudentLayout = ({ children }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    axiosInstance.get('/api/users/user/profile/')
      .then((res) => setFormData(res.data))
      .catch((err) => console.error('Failed to load profile', err));
  }, []);

  const getInitialsFromFullName = () => {
    const first = formData?.first_name || '';
    const last = formData?.last_name || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    const first = formData?.first_name || '';
    const last = formData?.last_name || '';
    return `${first} ${last}`.trim();
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <StudentSidebar
          initials={getInitialsFromFullName()}
          fullName={getFullName()}
        />
        <main className="form-section">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default StudentLayout;
