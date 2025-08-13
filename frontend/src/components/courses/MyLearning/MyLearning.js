import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CSpinner,
} from "@coreui/react";
import axiosInstance from "../../../utils/axiosInstance";
import Header from "../../../pages/layout/partials/Header";
import Footer from "../../../pages/layout/partials/Footer";

const MyLearning = () => {
  const [trackCards, setTrackCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchMyLearning = async () => {
      try {
        // 1️⃣ Get user's enrollments
        const enrollRes = await axiosInstance.get("/api/courses/my-courses/");
        const enrollments = enrollRes.data || [];
        let combinedTrackCards = [];

        // 2️⃣ For each enrollment, fetch course & track details
        await Promise.all(
          enrollments.map(async (enroll) => {
            let course = {
              id: enroll.course_id,
              slug: enroll.course_slug,
              name: enroll.course_name,
              logo: enroll.course_thumbnail,
              description: enroll.course_description || "",
            };

            if (enroll.track_id) {
              const trackRes = await axiosInstance.get(
                `/api/courses/tracks/${enroll.track_id}/`
              );
              combinedTrackCards.push({ course, track: trackRes.data });
            } else {
              const trackRes = await axiosInstance.get(
                `/api/courses/tracks/?course_slug=${course.slug}`
              );
              trackRes.data.forEach((track) => {
                combinedTrackCards.push({ course, track });
              });
            }
          })
        );

        setTrackCards(combinedTrackCards);
      } catch (err) {
        console.error("Error loading my learning:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLearning();
  }, []);

  const handleCardClick = async (course, track) => {
    try {
      const res = await axiosInstance.get(
        `/api/courses/sections/?track=${track.id}`
      );
      const sections = res.data;

      if (!sections.length || !sections[0].lectures?.length) {
        alert("This track has no available sections or lectures.");
        return;
      }

      const section = sections[0];
      const lecture = section.lectures[0];
      navigate(`/course-video/${course.slug}/${section.id}/${lecture.id}`);
    } catch (err) {
      console.error("Navigation error:", err);
      alert("Failed to load track content.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="d-flex justify-content-center my-5">
          <CSpinner color="primary" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Page Title Section */}
      <div className="bg-dark text-white py-3 text-center">
        <CContainer>
          <h2 className="mb-0 text-white">Explore Tracks from Courses</h2>
        </CContainer>
      </div>

      {/* Track Cards */}
      <CContainer className="my-5">
        <CRow className="gy-4">
          {trackCards.slice(0, visibleCount).map(({ course, track }) => (
            <CCol
              xs={12}
              sm={6}
              md={4}
              lg={4}
              key={`${course.id}-${track.id}`}
              className="d-flex"
            >
              <CCard
                onClick={() => handleCardClick(course, track)}
                className="shadow-sm border-0 course-card"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {/* Thumbnail */}
                <div
                  className="video-wrapper"
                  style={{
                    position: "relative",
                    height: "180px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={course.logo || "/assets/images/default-thumb.jpg"}
                    alt={course.name || "Course Thumbnail"}
                    className="w-100 h-100"
                    style={{
                      objectFit: "cover",
                      borderTopLeftRadius: "0.5rem",
                      borderTopRightRadius: "0.5rem",
                    }}
                  />
                  {/* Play Icon Overlay */}
                  <div
                    className="video-icon-overlay"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "2rem",
                      color: "#fff",
                      background: "rgba(0,0,0,0.5)",
                      padding: "0.5rem",
                      borderRadius: "50%",
                    }}
                  >
                    ▶
                  </div>
                </div>

                {/* Card Body */}
                <CCardBody className="p-4">
                  <h5 className="fw-bold text-dark mb-1">{track.name}</h5>
                  <p className="text-muted small mb-1">
                    <strong>Course:</strong> {course.name}
                  </p>
                  <p className="description-text text-muted small m-0">
                    {(course.description || "No description provided.")
                      .replace(/<[^>]*>/g, "")
                      .slice(0, 80)}
                  </p>
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>

        {/* Show More Button */}
        {trackCards.length > 6 && visibleCount < trackCards.length && (
          <div className="text-center mt-4">
            <div
              style={{
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#0d6efd",
              }}
              onClick={() => setVisibleCount((prev) => prev + 6)}
            >
              ↓ Show More
            </div>
          </div>
        )}
      </CContainer>

      <Footer />
    </>
  );
};

export default MyLearning;
