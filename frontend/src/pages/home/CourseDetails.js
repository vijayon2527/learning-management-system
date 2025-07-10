import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  FaStar,
  FaClock,
  FaUserGraduate,
  FaCheckCircle,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";
import Header from "../layout/partials/Header";
import Footer from "../layout/partials/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

const CourseDetail = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCurriculum, setExpandedCurriculum] = useState({ 0: true });
  const [previewVideo, setPreviewVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, tracksRes, featuresRes, featureValuesRes] =
          await Promise.all([
            axiosInstance.get(`/api/courses/courses/${id}/`),
            axiosInstance.get(`/api/courses/tracks/?course=${id}`),
            axiosInstance.get(`/api/courses/features/?course=${id}`),
            axiosInstance.get(`/api/courses/feature-values/?course=${id}`),
          ]);
        setCourse(courseRes.data);
        setTracks(tracksRes.data);
        setFeatures(featuresRes.data);
        setFeatureValues(featureValuesRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Could not load course data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const getFeatureValue = (trackId, featureId) => {
    const fv = featureValues.find(
      (f) =>
        (f.track === trackId || f.track?.id === trackId) &&
        (f.feature === featureId || f.feature?.id === featureId)
    );

    if (!fv || !fv.value || fv.value.trim() === "") {
      return "✅";
    }
    return fv.value;
  };

  const curriculumData = [
    {
      id: 1,
      name: "HTML Essentials",
      unlocked: true,
      description: "5 lectures • 25min",
      modules: [
        { id: 1, title: "Introduction to HTML", duration: "05:00", preview: true },
        { id: 2, title: "HTML Tags & Structure", duration: "06:00" },
        { id: 3, title: "Working with Links & Images", duration: "05:00" },
        { id: 4, title: "Lists and Tables", duration: "04:30" },
        { id: 5, title: "Forms & Inputs", duration: "04:30" },
      ],
    },
    {
      id: 2,
      name: "CSS Basics",
      unlocked: false,
      description: "4 lectures • 20min",
      modules: [
        { id: 1, title: "Getting Started with CSS", duration: "05:00" },
        { id: 2, title: "Selectors and Properties", duration: "06:00" },
        { id: 3, title: "Box Model", duration: "05:00" },
        { id: 4, title: "CSS Layouts", duration: "04:00" },
      ],
    },
  ];

  if (loading)
    return (
      <>
        <Header />
        <div style={styles.loaderContainer}>
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div style={styles.errorContainer}>
          <p>{error}</p>
        </div>
        <Footer />
      </>
    );

  if (!course)
    return (
      <>
        <Header />
        <div style={styles.errorContainer}>
          <p>Course not found.</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />
      <div style={styles.container}>
        {/* Hero */}
        <section style={styles.heroSection}>
          <img
            src={
              course.logo ||
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80"
            }
            alt={course.name}
            style={styles.heroImage}
            data-aos="fade-up"
            data-aos-delay="100"
          />
          <div style={styles.heroInfo} data-aos="fade-up" data-aos-delay="200">
            <h1 style={styles.courseTitle}>{course.name}</h1>
            <p style={styles.courseCategory}>{course.category_name}</p>
            <div style={styles.metaInfo}>
              <span>
                <FaClock /> {course.duration || "Self-paced"}
              </span>
              <span>
                <FaUserGraduate /> {course.certificate} Certified
              </span>
              <span>
                <FaStar style={{ color: "#f7b500" }} /> 4.8 rating
              </span>
            </div>
            <p style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>
              <FaStar color="#f7b500" /> 4.8 &nbsp;&nbsp;|&nbsp;&nbsp;1,234 students enrolled
            </p>
            <button
              onClick={() => setActiveTab("pricing")}
              style={{
                width: "50%",
                backgroundColor: "#006400",
                color: "white",
                padding: "0.75rem 1.5rem",
                fontSize: "16px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Enroll Now
            </button>
          </div>
        </section>

        {/* Tabs */}
        <nav style={styles.tabNav}>
          {["overview", "curriculum", "pricing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab ? styles.activeTab : {}),
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section style={styles.tabContent}>
          {activeTab === "overview" && (
            <>
              <h2 style={{ textAlign: "center", fontWeight: "bold" }}>About this Course</h2>
              <div dangerouslySetInnerHTML={{ __html: course.summary }} />

              <h3 style={{ marginTop: "2rem" }}>What you'll learn</h3>
              <ul style={{ listStyleType: "disc", paddingLeft: 24 }}>
                <li>Build full websites using HTML, CSS & JavaScript</li>
                <li>Develop REST APIs using Django</li>
                <li>Deploy apps to cloud platforms</li>
                <li>Use React for frontend development</li>
              </ul>

              {features.length > 0 && (
                <>
                  <h3 style={{ marginTop: "1.5rem" }}>Key Features</h3>
                  <ul style={{ paddingLeft: 20 }}>
                    {features.map((f) => (
                      <li key={f.id}>
                        <FaCheckCircle style={{ color: "#0070f3", marginRight: 2 }} />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {activeTab === "curriculum" && (
            <>
              <h2 style={{ textAlign: "center", fontWeight: "bold" }}>Course Curriculum</h2>
              <div style={{ marginBottom: 12 }}>
                {curriculumData.map((section, index) => (
                  <div
                    key={section.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() =>
                        setExpandedCurriculum((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      style={{
                        padding: "14px 16px",
                        backgroundColor: section.unlocked ? "#f7f7f7" : "#f0f0f0",
                        fontWeight: "600",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{section.name}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "0.9rem", color: "#555" }}>
                          {section.description}
                        </span>
                        <span
                          style={{
                            transform: expandedCurriculum[index]
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                            transition: "0.2s",
                            fontSize: "1rem",
                            color: section.unlocked ? "#000" : "#999",
                          }}
                        >
                          ▶
                        </span>
                      </span>
                    </div>

                    {expandedCurriculum[index] && (
                      <div style={{ padding: "12px 20px", backgroundColor: "#fff" }}>
                        {!section.unlocked && (
                          <div style={{ marginBottom: 10, color: "#d9534f", fontWeight: 500 }}>
                            Please enroll now to access this section.
                          </div>
                        )}
                        {previewVideo && (
                          <div style={{ marginTop: 20, textAlign: "center" }}>
                            <h3 style={{ marginBottom: 8 }}>{previewVideo.title}</h3>
                            <iframe
                              width="100%"
                              height="400"
                              src={previewVideo.url}
                              title={previewVideo.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                            <div style={{ marginTop: 10 }}>
                              <button
                                onClick={() => setPreviewVideo(null)}
                                style={{
                                  width: "15%",
                                  backgroundColor: "#006400",
                                  color: "white",
                                  padding: "0.75rem 1.5rem",
                                  fontSize: "16px",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Close Preview
                              </button>
                            </div>
                          </div>
                        )}
                        {section.modules.map((mod) => (
                          <div
                            key={mod.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "10px 0",
                              borderBottom: "1px solid #eee",
                              alignItems: "center",
                              color: section.unlocked ? "#333" : "#aaa",
                              filter: section.unlocked ? "none" : "blur(1px)",
                            }}
                          >
                            <span>
                              📄 {mod.title}
                              {mod.preview && section.unlocked && (
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPreviewVideo({
                                      title: mod.title,
                                      url: "https://www.youtube.com/embed/Z1Yd7upQsXY",
                                    });
                                  }}
                                  style={{ color: "#6c63ff", marginLeft: 10 }}
                                >
                                  Preview
                                </a>
                              )}
                            </span>
                            <span style={{ color: "#777" }}>
                              {mod.duration} {section.unlocked ? "" : "🔒"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "pricing" && (
            <>
              <h2 style={{ marginTop: 40, textAlign: "center", fontWeight: "bold" }}>
                Choose Your Plan
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "24px",
                  marginTop: "30px",
                }}
              >
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      padding: "24px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                      backgroundColor: "#fff",
                      minHeight: "420px",
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: "12px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#006400",
                            backgroundColor: "#e6f2e6",
                            padding: "6px 16px",
                            borderRadius: "999px",
                          }}
                        >
                          {track.name}
                        </span>
                      </div>
                      <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <p
                          style={{
                            fontSize: "1.8rem",
                            fontWeight: "bold",
                            margin: 0,
                            color: "#000",
                          }}
                        >
                          {track.fee ? `₹${Number(track.fee).toFixed(2)}` : "Free"}
                        </p>
                        <p style={{ color: "#666", fontSize: "0.95rem" }}>per course</p>
                      </div>
                      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
                        {features.map((f) => {
                          const value = getFeatureValue(track.id, f.id);
                          return (
                            <li
                              key={f.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 10,
                                fontSize: "0.95rem",
                                color: "#333",
                              }}
                            >
                              <span>
                                {f.name}: <strong>{value}</strong>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div style={{ marginTop: "auto" }}>
                      <button
                        style={{
                          width: "100%",
                          backgroundColor: "#006400",
                          color: "white",
                          padding: "0.75rem 1.5rem",
                          fontSize: "16px",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          marginTop: 12,
                        }}
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Share Section */}
        <section style={styles.shareSection}>
          <h3>Share this course</h3>
          <div style={styles.shareIcons}>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook size={28} style={styles.shareIcon} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter size={28} style={styles.shareIcon} />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin size={28} style={styles.shareIcon} />
            </a>
            <a
              href="mailto:?subject=Check%20out%20this%20course"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaEnvelope size={28} style={styles.shareIcon} />
            </a>
          </div>
        </section>

        {/* Business Inquiry */}
        <section style={styles.businessSection}>
          <h3 style={{ fontSize: "1.6rem", marginBottom: 8 }}>
            Interested in this course for your business or team?
          </h3>
          <p style={{ color: "#555", marginBottom: 16 }}>
            Train your employees in the most in-demand topics with our business solutions.
          </p>
          <button style={styles.requestButton}>Request more info</button>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetail;

const styles = {
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "0 20px",
  },
  heroSection: {
    display: "flex",
    gap: 80,
    flexWrap: "wrap",
    marginBottom: 40,
    alignItems: "center",
  },
  heroImage: {
    flexShrink: 0,
    width: 800,
    height: 380,
    objectFit: "cover",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  heroInfo: {
    flex: 1,
    minWidth: 280,
  },
  courseTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
  },
  courseCategory: {
    color: "#000",
    fontWeight: 600,
  },
  metaInfo: {
    display: "flex",
    gap: 24,
    color: "#555",
    fontSize: 14,
    margin: "12px 0",
  },
  tabNav: {
    display: "flex",
    borderBottom: "1px solid #ddd",
    marginBottom: 12,
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10,
  },
  tabButton: {
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    color: "#444",
  },
  activeTab: {
    borderBottomColor: "#000",
    color: "#000",
  },
  tabContent: {
    minHeight: 200,
  },
  shareSection: {
    textAlign: "center",
    marginTop: 40,
  },
  shareIcons: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
  },
  shareIcon: {
    cursor: "pointer",
    color: "#222",
  },
  businessSection: {
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    padding: "30px 20px",
    marginTop: 40,
    borderRadius: 6,
  },
  requestButton: {
    backgroundColor: "#e85c00",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.5rem",
    fontSize: 16,
    borderRadius: 6,
    cursor: "pointer",
  },
  loaderContainer: {
    padding: "4rem",
    textAlign: "center",
  },
  errorContainer: {
    padding: "4rem",
    textAlign: "center",
    color: "red",
  },
};
