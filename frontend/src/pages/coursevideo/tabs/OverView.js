// OverView.js
import React from 'react';
import { FaRegClock } from "react-icons/fa";
import { BsStarFill, BsGlobe, BsFillCalendarFill } from "react-icons/bs";
import './OverView.css';

const OverView = ({ course }) => {
  if (!course) return <p>Loading...</p>;

  const {
    name,
    average_rating,
    enrolled_students,
    estimated_duration,
    updated_at,
    language = "English", // fallback if not in model
    lectures_count = 0,   // you may need to calculate this if not included in model
  } = course;

  const totalHours = estimated_duration
    ? `${Math.floor(parseFloat(estimated_duration) / 3600)} hours`
    : 'N/A';

  return (
    <div className='course-tab-overview'>
      <div className="course-details">
        <h2 className="course-title">{name}</h2>
        <div className="course-stats">
          <span className="rating">
            <BsStarFill className="star-icon" /> <strong>{average_rating.toFixed(1)}</strong>
            <span className="rating-count">{enrolled_students} students</span>
          </span>
          <span className="students"><strong>{enrolled_students}</strong> Students</span>
          <span className="total-time"><strong>{totalHours}</strong> Total</span>
        </div>

        <div className="course-meta">
          <span><BsFillCalendarFill /> Last updated {new Date(updated_at).toLocaleDateString()}</span>
          <span><BsGlobe /> {language} <span className="language-auto">{language} [Auto]</span></span>
        </div>

        <div className="reminder">
          <div className="learning-remainder">
            <div className="reminder-icon">
              <FaRegClock size={24} />
            </div>
            <div className="reminder-text">
              <h5>Schedule learning time</h5>
              <p>Learning a little each day adds up. Set time aside to learn and get reminders using your learning scheduler.</p>
            </div>
          </div>

          <div className="reminder-buttons">
            <button className="btn btn-outline-warning">Get started</button>
            <button className="btn btn-light">Dismiss</button>
          </div>
        </div>

        <div className="course-info">
          <div><h6>By the numbers</h6></div>
          <div><strong>Skill level:</strong> All Levels</div>
          <div><strong>Students:</strong> {enrolled_students}</div>
          <div><strong>Languages:</strong> {language}</div>
          <div><strong>Captions:</strong> Yes</div>
          <div><strong>Lectures:</strong> {lectures_count}</div>
          <div><strong>Video:</strong> {totalHours}</div>
        </div>
      </div>
    </div>
  );
};

export default OverView;
