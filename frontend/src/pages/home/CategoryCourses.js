import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../layout/partials/Header";
import Footer from "../layout/partials/Footer";

const CategoryCourses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated cleaner function
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  useEffect(() => {
    const fetchCategoryAndCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const categoryResponse = await axiosInstance.get(`/api/courses/categories/${id}/`);
        setCategory(categoryResponse.data);

        const coursesResponse = await axiosInstance.get(`/api/courses/courses/?category=${id}`);
        setCourses(coursesResponse.data);
      } catch (err) {
        console.error("Error loading category or courses:", err);
        setError("Failed to load data for this category.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndCourses();
  }, [id]);

  const cardStyle = {
    cursor: "pointer",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.2s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const cardHoverStyle = {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  };

  const truncate = (text, maxLength) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <>
      <Header />
      <main style={{ padding: "1rem", minHeight: "70vh" }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <>
            <h2 style={{ marginBottom: "1rem" }}>
              Courses in{" "}
              <span style={{ color: "#007BFF" }}>
                {category ? category.name : "Selected Category"}
              </span>
            </h2>

            {courses.length === 0 ? (
              <p>No courses found in this category.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                {courses.map((course) => (
                  <div
                    key={course.id}
                    style={cardStyle}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, cardHoverStyle);
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, cardStyle);
                    }}
                  >
                    {/* Course Image */}
                    <div style={{ height: "160px", overflow: "hidden" }}>
                      {course.logo ? (
                        <img
                          src={course.logo}
                          alt={course.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f0f0f0",
                            color: "#999",
                            fontStyle: "italic",
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Course Name and Info */}
                    <div style={{ padding: "1rem", flexGrow: 1 }}>
                      <h4 style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>
                        {course.name}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#666",
                          marginBottom: "1rem",
                        }}
                      >
                        {truncate(stripHtmlTags(course.summary), 100) || "No description available."}
                      </p>
                    </div>

                    {/* View Button */}
                    <div style={{ padding: "0 1rem 1rem" }}>
                      <button
                        style={{
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.5rem 1rem",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default CategoryCourses;
