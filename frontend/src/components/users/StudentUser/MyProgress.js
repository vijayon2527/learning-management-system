// src/pages/student/MyProgress.js

import React, { useEffect, useState } from 'react';
import StudentLayout from './StudentLayout';
import axiosInstance from '../../../utils/axiosInstance';

const MyProgress = () => {
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
      <h2>Progress Tracker</h2>
      {loading ? (
        <p>Loading progress...</p>
      ) : courses.length === 0 ? (
        <p>You haven't enrolled in any courses yet.</p>
      ) : (
        <div>
          {courses.map((enrollment) => (
            <div
              key={enrollment.id}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px'
              }}
            >
              <h3>{enrollment.course.name}</h3>
              <div style={{ background: '#eee', height: '10px', borderRadius: '5px' }}>
                <div
                  style={{
                    width: `${enrollment.progress}%`,
                    background: '#4caf50',
                    height: '10px',
                    borderRadius: '5px'
                  }}
                />
              </div>
              <p>{enrollment.progress.toFixed(2)}% complete</p>
              {enrollment.completed && (
                <p style={{ color: 'green' }}>✔ Completed</p>
              )}
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default MyProgress;
