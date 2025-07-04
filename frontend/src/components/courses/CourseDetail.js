import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CButton,
} from "@coreui/react";
import axiosInstance from "../../utils/axiosInstance";

const stripHtmlTags = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/api/courses/courses/${id}/`);
        setCourse(res.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Could not load course.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <CSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-center p-4">
        {error}
        <div className="mt-3">
          <CButton color="secondary" onClick={() => navigate(-1)}>
            Back
          </CButton>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <CCard
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        borderRadius: "12px",
        padding: "1.5rem",
      }}
    >
      <CCardBody>
        <CRow className="align-items-center g-4">
          {/* Left: Circular Logo */}
          <CCol
            md={4}
            className="d-flex justify-content-center"
            style={{ flexDirection: "column", alignItems: "center" }}
          >
            {course.logo ? (
              <img
                src={course.logo}
                alt="Course Logo"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15), 0 0 0 4px #fff",
                  border: "2px solid #ddd",
                  backgroundColor: "#fff",
                }}
              />
            ) : (
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  border: "2px dashed #bbb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                  fontStyle: "italic",
                  backgroundColor: "#f8f8f8",
                }}
              >
                No Logo
              </div>
            )}
          </CCol>

          {/* Right: Details */}
          <CCol md={8}>
            <h1
              className="mb-4"
              style={{
                fontWeight: "700",
                color: "#2c3e50",
                borderBottom: "3px solid #0d6efd",
                paddingBottom: 6,
                letterSpacing: 1,
              }}
            >
              {course.name}
            </h1>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "700", color: "#34495e", letterSpacing: "0.5px" }}>
                Summary
              </h5>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                }}
              >
                {stripHtmlTags(course.summary)}
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "700", color: "#34495e", letterSpacing: "0.5px" }}>
                Category
              </h5>
              <p style={{ fontSize: 16, color: "#666" }}>
                {course.category_name || "-"}
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "700", color: "#34495e", letterSpacing: "0.5px" }}>
                Status
              </h5>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: course.is_active ? "#198754" : "#6c757d",
                }}
              >
                {course.is_active ? "Active" : "Inactive"}
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "700", color: "#34495e", letterSpacing: "0.5px" }}>
                Created At
              </h5>
              <p style={{ fontSize: 16, color: "#666" }}>
                {course.created_at
                  ? new Date(course.created_at).toLocaleString()
                  : "-"}
              </p>
            </section>

            <div className="d-flex justify-content-end mt-4">
              <CButton
                color="secondary"
                onClick={() => navigate(-1)}
                style={{ fontWeight: "600", padding: "0.6rem 1.4rem" }}
              >
                Back
              </CButton>
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default CourseDetail;
