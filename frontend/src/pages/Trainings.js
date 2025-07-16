import React, { useEffect, useState } from "react";
import Header from "./layout/partials/Header";
import Footer from "./layout/partials/Footer";
import "../pages/home/UpcomingTrainings.css";
import axiosInstance from "../utils/axiosInstance";
import RecentlyViewed from "./Trainings/RecentlyViewed";
import CareerBlogs from "./Trainings/CareerBlogs";
import { Link } from "react-router-dom";

const Trainings = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/api/courses/courses/");
        setCourses(response.data);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <Header />
      <main>
        {/* 🟦 Upcoming Trainings Section */}
        <div className="upcoming-trainings">
          <h2 className="section-title">Courses</h2>

          {loading && <p>Loading courses...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && courses.length === 0 && (
            <p>No upcoming courses available right now.</p>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="training-cards">
              {courses.map((course, index) => (
                <Link
                  to={`/courses/${course.slug}`}
                  className="training-card"
                  key={course.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 150}
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
                    {course.price && <p className="card-price">₹ {course.price}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 🟩 Recently Viewed Section */}
        <RecentlyViewed />

        {/* 🟨 Career Blogs Section */}
        <CareerBlogs />
      </main>
      <Footer />
    </div>
  );
};

export default Trainings;
