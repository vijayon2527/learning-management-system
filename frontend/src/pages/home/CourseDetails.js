import React, { useEffect, useState } from "react"; 
import { useParams, Link } from "react-router-dom";
import { CSpinner } from "@coreui/react";
import { FaStar, FaClock, FaUsers, FaCertificate } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../layout/partials/Header";
import Footer from "../layout/partials/Footer";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/api/courses/courses/${id}/`);
        setCourse(res.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Could not load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={styles.spinnerContainer}>
          <CSpinner color="primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={styles.errorMessage}>{error}</div>
        <Footer />
      </>
    );
  }

  if (!course) return null;

  // helper to strip HTML tags
  const cleanText = (html) => html.replace(/<\/?[^>]+(>|$)/g, "");

  const image =
    course.logo && course.logo.trim() !== ""
      ? course.logo
      : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80";

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.mainContent}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Banner‐style course image */}
            <div style={styles.imageWrapper}>
              <img src={image} alt="Course" style={styles.courseImage} />
            </div>

            <h1 style={styles.title}>{course.name}</h1>

            <div style={styles.infoBar}>
              <div style={styles.infoItem}><FaClock /> {course.duration || "Self-paced"}</div>
              <div style={styles.infoItem}><FaCertificate /> Certificate</div>
              <div style={styles.infoItem}><FaUsers /> {course.enrollment_count || "N/A"} students</div>
              <div style={styles.infoItem}><FaStar color="#f4c150" /> 4.8 rating</div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              {["overview", "curriculum", "reviews", "instructor"].map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === tab ? styles.tabButtonActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
              {activeTab === "overview" && (
                <div>
                  <h2>Course Overview</h2>
                  <p>
                    {course.summary
                      ? cleanText(course.summary)
                      : "No description available."}
                  </p>
                </div>
              )}
              {activeTab === "curriculum" && (
                <div>
                  <h2>Curriculum</h2>
                  <ul style={styles.list}>
                    <li>Module 1: Introduction</li>
                    <li>Module 2: Core Concepts</li>
                    <li>Module 3: Real-world Application</li>
                    <li>Module 4: Final Project</li>
                  </ul>
                </div>
              )}
              {activeTab === "reviews" && (
                <div>
                  <h2>Reviews</h2>
                  <p>⭐⭐⭐⭐⭐ "Fantastic course!"</p>
                  <p>⭐⭐⭐⭐ "Very helpful and practical."</p>
                </div>
              )}
              {activeTab === "instructor" && (
                <div>
                  <h2>Instructor</h2>
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Instructor"
                    style={styles.instructorPhoto}
                  />
                  <p>John Doe is a professional instructor with 10+ years of experience.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            <div style={styles.enrollCard}>
              <p style={styles.price}>₹499</p>
              <Link to="/enroll">
                <button style={styles.enrollButton}>Enroll Now</button>
              </Link>
              <ul style={styles.featuresList}>
                <li>✔️ Lifetime access</li>
                <li>✔️ Certificate of completion</li>
                <li>✔️ 30-day money-back guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetail;

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem",
  },
  mainContent: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
  },
  leftColumn: {
    flex: "1 1 700px",
  },
  rightColumn: {
    flex: "0 0 300px",
    position: "sticky",
    top: "80px",
    alignSelf: "flex-start",
  },
  imageWrapper: {
  width: "100%",
  height: "400px",
  overflow: "hidden",
  borderRadius: "12px",
  marginBottom: "1rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
},
courseImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center", // ← Adjust as needed
  display: "block",
},

  courseImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center top", // ← Adjust as needed
  display: "block",
},
  title: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  infoBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1rem",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.85rem",
    background: "#f9f9f9",
    padding: "0.4rem 0.6rem",
    borderRadius: "4px",
  },
  tabs: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    borderBottom: "1px solid #ddd",
  },
  tabButton: {
    background: "transparent",
    border: "none",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
  tabButtonActive: {
    borderBottom: "2px solid #ec5252",
    fontWeight: "bold",
  },
  tabContent: {
    marginTop: "1rem",
  },
  list: {
    listStyle: "disc",
    paddingLeft: "1.5rem",
    lineHeight: "1.6",
  },
  instructorPhoto: {
    width: "100px",
    borderRadius: "50%",
    marginBottom: "1rem",
  },
  enrollCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    padding: "1rem",
    textAlign: "center",
  },
  price: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  enrollButton: {
    width: "100%",
    background: "#ec5252",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    textAlign: "left",
    lineHeight: "1.6",
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
  },
  errorMessage: {
    textAlign: "center",
    color: "#c00",
    padding: "2rem",
  },
};
