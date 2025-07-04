import React, { useEffect, useState } from "react";
import "./RecentlyViewed.css";
import "../../pages/home/UpcomingTrainings.css";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

const RecentlyViewed = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch latest courses ordered by creation date or ID
        const response = await axiosInstance.get("/api/courses/courses/?ordering=-id");
        setCourses(response.data.slice(0, 3));
      } catch (err) {
        console.error("Error loading recently viewed courses:", err);
        setError("Failed to load recently viewed courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCourses();
  }, []);

  return (
    <div className="recently-viewed">
      <h2 className="section-title text-center">Recently Viewed</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <p style={{ textAlign: "center" }}>No courses found.</p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="recent-cards-scroll">
          <div className="recent-cards-wrapper">
            {courses.map((course) => (
              <Link
                to={`/courses/${course.id}`}
                className="training-card"
                key={course.id}
              >
                <div className="image-wrapper">
                  <img
                    src={course.logo || "https://via.placeholder.com/600x300?text=No+Image"}
                    alt={course.name}
                    className="card-img"
                  />
                </div>
                <div className="card-text">
                  <h5 className="card-title">{course.name}</h5>
                  {course.price && (
                    <p className="card-price">₹ {course.price}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
