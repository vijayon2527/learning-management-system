// src/components/learning/MyLearning.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance';
import Header from '../../../pages/layout/partials/Header';
import Footer from '../../../pages/layout/partials/Footer';

const MyLearning = () => {
  const [courses, setCourses] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get('/api/courses/public-courses/')
      .then((res) => setCourses(res.data))
      .catch((err) => console.error('Error fetching courses:', err));
  }, []);

  return (
    <>
      <Header />
      <div className="bg-dark text-white py-3 text-center">
        <CContainer>
          <h2 className="mb-0 text-white">Explore Inspiring Online Courses</h2>
        </CContainer>
      </div>

      <CContainer className="my-5">
        <CRow className="gy-4">
          {courses.slice(0, visibleCount).map((course) => (
            <CCol xs={12} sm={6} md={4} lg={4} key={course.id}>
              <CCard
               onClick={async () => {
  try {
    const res = await axiosInstance.get(`/api/courses/sections/?course_slug=${course.slug}`);
    const sections = res.data;

    if (!sections.length || !sections[0].lectures?.length) {
      alert("This course has no available sections or lectures.");
      return;
    }

    const section = sections[0];
    const lecture = section.lectures[0];

    navigate(`/course-video/${course.slug}/${section.id}/${lecture.id}`);
  } catch (err) {
    console.error('Navigation error:', err);
    alert('Failed to load course content.');
  }
}}

                className="shadow-sm border-0 course-card"
                style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div className="video-wrapper" style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                  <img
                    src={course.logo || '/assets/images/default-thumb.jpg'}
                    alt={course.name}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      borderTopLeftRadius: '0.5rem',
                      borderTopRightRadius: '0.5rem',
                    }}
                  />

                  {/* ▶ Icon shown on hover */}
                  {course.promotional_video && (
                    <div className="video-icon-overlay">
                      ▶
                    </div>
                  )}
                </div>

                <CCardBody className="p-4">
                  <h2 className="fw-bold text-dark mb-1">{course.name}</h2>

                  <div className="description-box mt-2" style={{ minHeight: '50px' }}>
                    <p className="description-text text-muted small m-0">
                      {course.description?.replace(/<[^>]*>/g, '').slice(0, 100) ||
                        'No description provided.'}
                    </p>
                  </div>

                  {/* Optional Tags/Skills */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="mt-2">
                      {course.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="badge bg-secondary me-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>

        {/* Show More Button */}
        {courses.length > 6 && (
          <div className="text-center mt-4">
            {visibleCount < courses.length ? (
              <div
                style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#0d6efd' }}
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                ↓ Show More
              </div>
            ) : (
              <div
                style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#0d6efd' }}
                onClick={() => setVisibleCount(6)}
              >
                ↑ Show Less
              </div>
            )}
          </div>
        )}
      </CContainer>

      <Footer />
    </>
  );
};

export default MyLearning;
