import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UpcomingTrainings.css";
import axiosInstance from "../../utils/axiosInstance";

const stripHtmlTags = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const UpcomingTrainings = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get("/api/courses/courses/");
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Could not load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-danger text-center p-4">{error}</div>;
  }

  return (
  <div className="upcoming-trainings">
    {/* Outer Card */}
    <div className="outer-card">
      <h2 className="section-title">Our Top Courses</h2>

      <div className="training-cards">
        {courses.slice(0, 4).map((item, index) => (
          <div
            key={item.id}
            className="training-card"
            data-aos="fade-up"
            data-aos-delay={index * 150}
            onClick={() => navigate(`/courses/${item.slug}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="image-wrapper">
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.name}
                  className="card-img"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    color: "#888",
                    fontStyle: "italic",
                  }}
                >
                  No Image
                </div>
              )}
            </div>
            <div className="card-text">
              <h5 className="card-title">{item.name}</h5>
            </div>
          </div>
        ))}
      </div>

      <div className="view-all-container">
        <button
          className="view-all-btn"
          onClick={() => navigate("/trainings")}
        >
          VIEW ALL TRAININGS
        </button>
      </div>
    </div>
  </div>
);
};

export default UpcomingTrainings;
