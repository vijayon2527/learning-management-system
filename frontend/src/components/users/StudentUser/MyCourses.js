// src/pages/student/MyCourses.js
import React, { useEffect, useState } from 'react';
import StudentLayout from './StudentLayout';
import axiosInstance from '../../../utils/axiosInstance';
import './MyCourses.css';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/my-courses/')
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <StudentLayout>
      <h2 style={{ marginBottom: '20px' }}>My Courses</h2>
      {loading ? (
        <p>Loading your courses...</p>
      ) : courses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        <div className="course-card-grid">
          {courses.map((enrollment) => (
            <div className="course-card" key={enrollment.id}>
              {enrollment.course.thumbnail && (
                <img
                  src={enrollment.course.thumbnail}
                  alt={enrollment.course.name}
                  className="course-thumbnail"
                />
              )}
              <h3>{enrollment.course.name}</h3>
              <p>Progress: {enrollment.progress.toFixed(2)}%</p>
              {enrollment.completed && (
                <p className="completed-status">✔ Completed</p>
              )}
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default MyCourses;
