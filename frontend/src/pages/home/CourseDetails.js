import React, { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaStar,
  FaClock,
  FaUserGraduate,
  FaCheckCircle,
  FaThumbsUp,
  FaThumbsDown ,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import Header from "../layout/partials/Header";
import Footer from "../layout/partials/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import TopRatingsSlider from "./RatingBreakDown";
import RazorpayPayment from "./Payement";
import { useLocation } from "react-router-dom";
import Login from "../../views/pages/login/Login";

const CourseDetail = (user) => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureValues, setFeatureValues] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCurriculum, setExpandedCurriculum] = useState({});
  const [curriculumData, setCurriculumData] = useState([]);
  const [previewPlaying, setPreviewPlaying] = useState({});
  const [visibleReviews, setVisibleReviews] = useState(2);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = React.useState(false);
  const [dotsMenuOpen, setDotsMenuOpen] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null); // store which track user enrolled for
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = React.useState(null);
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const loginModalRef = React.useRef(null);
  const [enrolledTrackIds, setEnrolledTrackIds] = useState([]);

  
  const [showAllLectures, setShowAllLectures] = useState({});

useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // 👈 scroll to top when page loads
  const fetchData = async () => {
    setLoading(true);
    try {
      const courseRes = await axiosInstance.get(`/api/courses/courses/${slug}/`);
      setCourse(courseRes.data);
      const courseId = courseRes.data.id;

      const [tracksRes, featuresRes, featureValuesRes, reviewsRes] = await Promise.all([
        axiosInstance.get(`/api/courses/tracks/?course_id=${courseId}`),
        axiosInstance.get(`/api/courses/features/?course_id=${courseId}`),
        axiosInstance.get(`/api/courses/feature-values/?course_id=${courseId}`),
        axiosInstance.get(`/api/courses/reviews/?course=${courseId}`),
      ]);
      setTracks(tracksRes.data);
      setFeatures(featuresRes.data);
      setFeatureValues(featureValuesRes.data);
      setReviews(reviewsRes.data);
      setReviewsLoading(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load course data.");
      setReviewsLoading(false);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [slug]);

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!tracks.length) {
        setCurriculumData([]);
        return;
      }
      try {
        const sectionPromises = tracks.map((track) =>
          axiosInstance.get(`/api/courses/sections/?track=${track.id}`)
        );
        const sectionResponses = await Promise.all(sectionPromises);
        const sectionsWithTrack = [];
        sectionResponses.forEach((res, idx) => {
          const track = tracks[idx];
          res.data.forEach((section) => {
            sectionsWithTrack.push({
              ...section,
              trackName: track.name,
              trackId: track.id,
            });
          });
        });
        const lecturePromises = sectionsWithTrack.map((section) =>
          axiosInstance.get(`/api/courses/lectures/?section=${section.id}`)
        );
        const lectureResponses = await Promise.all(lecturePromises);
        const curriculum = sectionsWithTrack.map((section, index) => ({
          id: section.id,
          trackId: section.trackId,
          trackName: section.trackName,
          name: section.name,
          description: `${lectureResponses[index].data.length} lectures`,
          unlocked: true,
          modules: lectureResponses[index].data.map((lec) => ({
            id: lec.id,
            title: lec.name,
            duration: lec.duration || "00:05:00",
            preview: lec.is_preview || false,
            video_url: lec.video || null,
          })),
        }));
        setCurriculumData(curriculum);
        setExpandedCurriculum({ 0: true });
      } catch (error) {
        console.error("Error loading curriculum:", error);
        setCurriculumData([]);
      }
    };
    loadCurriculum();
  }, [tracks]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const [reviewStates, setReviewStates] = useState(() =>
  reviews.reduce((acc, review) => {
    acc[review.id] = {
      liked: false,
      disliked: false,
      likeCount: review.likeCount || 0,
      dislikeCount: review.dislikeCount || 0,
    };
    return acc;
  }, {})
);

useEffect(() => {
  setReviewStates((prev) => {
    const updated = { ...prev };
    reviews.forEach((review) => {
      if (!updated[review.id]) {
        updated[review.id] = {
          liked: false,
          disliked: false,
          likeCount: review.likeCount || 0,
          dislikeCount: review.dislikeCount || 0,
        };
      }
    });
    return updated;
  });
}, [reviews]);

useEffect(() => {
    const handleCloseLogin = () => {
      setShowLoginModal(false);
    };

    window.addEventListener("close-login", handleCloseLogin);
    return () => window.removeEventListener("close-login", handleCloseLogin);
  }, []);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginModalRef.current && !loginModalRef.current.contains(event.target)) {
        setShowLoginModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleLike = (id) => {
  setReviewStates((prev) => {
    const r = prev[id];
    if (r.liked) {
      return {
        ...prev,
        [id]: { ...r, liked: false, likeCount: r.likeCount - 1 },
      };
    }
    return {
      ...prev,
      [id]: {
        ...r,
        liked: true,
        disliked: false,
        likeCount: r.likeCount + 1,
        dislikeCount: r.disliked ? r.dislikeCount - 1 : r.dislikeCount,
      },
    };
  });
};

const handleDislike = (id) => {
  setReviewStates((prev) => {
    const r = prev[id];
    if (r.disliked) {
      return {
        ...prev,
        [id]: { ...r, disliked: false, dislikeCount: r.dislikeCount - 1 },
      };
    }
    return {
      ...prev,
      [id]: {
        ...r,
        disliked: true,
        liked: false,
        dislikeCount: r.dislikeCount + 1,
        likeCount: r.liked ? r.likeCount - 1 : r.likeCount,
      },
    };
  });
};

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setTabLoading(true);
    setActiveTab(tab);

    setTimeout(() => {
      setTabLoading(false);
    }, 500);
  };

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
const timeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("trackId");

  if (trackId) {
    setSelectedTrackId(parseInt(trackId));
    setShowPayment(true);
    // Optional: clean up URL after showing
    params.delete("trackId");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }
}, []);


const handleLoginSuccess = () => {
  const redirectData = JSON.parse(sessionStorage.getItem("redirectAfterLogin") || '{}');
  sessionStorage.removeItem("redirectAfterLogin");

  setShowLoginModal(false);
  fetchEnrolledTracks(); 

  if (redirectData.from) {
    const { from, trackId } = redirectData;
    navigate(`${from}?trackId=${trackId}`);
  } else {
    navigate(location.pathname); // fallback to current path
  }
};




useEffect(() => {
  const handleOutsideClick = (event) => {
    if (loginModalRef.current && !loginModalRef.current.contains(event.target)) {
      setShowLoginModal(false);
    }
  };

  if (showLoginModal) {
    document.addEventListener("mousedown", handleOutsideClick);
  } else {
    document.removeEventListener("mousedown", handleOutsideClick);
  }

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, [showLoginModal]);


const handleEnroll = (trackId) => {
    const tokens = localStorage.getItem("authTokens");
    const token = tokens ? JSON.parse(tokens).access : null;

    if (!token) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        JSON.stringify({
          from: window.location.pathname,
          trackId,
        })
      );
      setShowLoginModal(true);
    } else {
      setSelectedTrackId(trackId);
      setShowPayment(true);
    }
  };

useEffect(() => {
  if (location.state?.trackId && localStorage.getItem("access_token")) {
    setSelectedTrackId(location.state.trackId);
    setShowPayment(true);
  }
}, []);


const fetchEnrolledTracks = async () => {
  const tokens = localStorage.getItem("authTokens");
  const token = tokens ? JSON.parse(tokens).access : null;

  if (!token) return;

  try {
    const res = await axiosInstance.get("/api/courses/enrollments/my-enrollments/");
    const trackMap = {};
    res.data.forEach(({ course_id, track_id }) => {
      if (track_id) {
        trackMap[track_id] = course_id;
      }
    });
    setEnrolledTrackIds(Object.keys(trackMap).map(Number));
  } catch (error) {
    console.error("Failed to fetch enrolled tracks:", error);
  }
};

useEffect(() => {
  fetchEnrolledTracks();
}, []);


  const closePayment = () => {
    setShowPayment(false);
    setSelectedTrack(null);
  };

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


  // Skeleton placeholder for Hero Section
  const HeroSkeleton = () => (
    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 40 }}>
      <Skeleton height={380} width={800} borderRadius={8} />
      <div style={{ flex: 1, minWidth: 280 }}>
        <Skeleton height={40} width={"70%"} />
        <Skeleton height={20} width={"40%"} style={{ marginTop: 10 }} />
        <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
          <Skeleton height={20} width={80} />
          <Skeleton height={20} width={120} />
          <Skeleton height={20} width={90} />
        </div>
      </div>
    </div>
  );

  const OverviewSkeleton = () => (
    <div>
      <Skeleton height={30} width={200} style={{ marginBottom: 20 }} />
      <Skeleton count={5} />
      <div style={{ marginTop: 30 }}>
        <Skeleton height={25} width={150} style={{ marginBottom: 10 }} />
        <Skeleton count={3} width={"60%"} style={{ marginBottom: 6 }} />
      </div>
    </div>
  );

const handleShowToggle = () => setShowAllReviews((prev) => !prev);
const ratingsCount = reviews.reduce((acc, review) => {
  acc[review.rating] = (acc[review.rating] || 0) + 1;
  return acc;
}, {});

  const CurriculumSkeleton = () => (
    <div>
      <Skeleton height={30} width={150} style={{ marginBottom: 20, marginLeft: "40%" }} />
      {[...Array(3)].map((_, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            marginBottom: "12px",
            overflow: "hidden",
            padding: "12px 16px",
          }}
        >
          <Skeleton height={25} width={"80%"} style={{ marginBottom: 12 }} />
          {[...Array(4)].map((__, i2) => (
            <div
              key={i2}
              style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}
            >
              <Skeleton height={20} width={"70%"} />
              <Skeleton height={20} width={50} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const PricingSkeleton = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginTop: "30px",
      }}
    >
      {[...Array(2)].map((_, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
            backgroundColor: "#fff",
            minHeight: "420px",
          }}
        >
          <Skeleton height={30} width={"60%"} style={{ marginBottom: 20 }} />
          <Skeleton height={40} width={"40%"} style={{ marginBottom: 10 }} />
          <Skeleton height={20} width={"30%"} style={{ marginBottom: 40 }} />
          {[...Array(6)].map((__, i2) => (
            <Skeleton key={i2} height={20} width={"80%"} style={{ marginBottom: 12 }} />
          ))}
          <Skeleton height={40} width={"100%"} borderRadius={8} />
        </div>
      ))}
    </div>
  );

  if (loading)
    return (
      <>
        <Header />
        <div style={styles.container}>
          <HeroSkeleton />
          <div style={styles.tabNav}>
            {["overview", "curriculum", "pricing"].map((tab) => (
              <Skeleton
                key={tab}
                height={40}
                width={100}
                style={{ marginRight: 16, borderRadius: 8 }}
              />
            ))}
          </div>
          <OverviewSkeleton />
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


  if (selectedTrackId) {
    return (
      <RazorpayPayment
        trackId={selectedTrackId}
        onCancel={() => setSelectedTrackId(null)}
      />
    );
  }

 return (
  <>
    <Header />

    <div style={styles.container}>
      {/* HERO */}
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
              <FaStar style={{ color: "#199fcc" }} /> 4.8 rating
            </span>
          </div>
        </div>
      </section>

      {/* TABS */}
      <nav style={styles.tabNav}>
        {["overview", "curriculum", "pricing"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`tabs-btn ${activeTab === tab ? "active" : ""}`}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
            disabled={tabLoading}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* TAB CONTENT */}
      {tabLoading ? (
        <>
          {activeTab === "overview" && <OverviewSkeleton />}
          {activeTab === "curriculum" && <CurriculumSkeleton />}
          {activeTab === "pricing" && <PricingSkeleton />}
        </>
      ) : (
        <section style={styles.tabContent}>
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <h2 style={{ textAlign: "center", fontWeight: "bold", marginBottom: 16 }}>
                About this Course
              </h2>

              <div dangerouslySetInnerHTML={{ __html: course.summary }} />

              {features.length > 0 && (
                <>
                  <h3 style={{ marginTop: "2rem", marginBottom: 12, color: "#0070f3" }}>
                    Key Features
                  </h3>
                  <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
                    {features.map((f) => (
                      <li
                        key={f.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 6,
                          fontWeight: 500,
                          color: "#333",
                        }}
                      >
                        <FaCheckCircle style={{ color: "#2a40ed", marginRight: 8 }} />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* TOP REVIEWS SLIDER */}
              <div style={{ marginTop: "3rem", textAlign: "center" }}>
                <div style={{ margin: "1rem 20px" }}>
                  <TopRatingsSlider reviews={reviews} />
                </div>
              </div>

              <h2 style={{ fontWeight: "bold", textAlign: "center", color: "#222" }}>
                ⭐ {typeof course?.average_rating === "number" ? course.average_rating.toFixed(1) : "4.5"} course rating •{" "}
                {Array.isArray(reviews) ? reviews.length : 0} ratings
              </h2>

              {reviewsLoading ? (
                <Skeleton count={3} />
              ) : !Array.isArray(reviews) || reviews.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}>
                  No reviews yet.
                </p>
              ) : (
                <>
                  <div
                    style={{
                      marginTop: "2rem",
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "1.5rem",
                    }}
                  >
                    {reviews
                      .slice(0, showAllReviews ? reviews.length : 4)
                      .map((review) => {
                        const reviewState = reviewStates[review.id] || {};
                        const liked = reviewState?.liked ?? false;
                        const disliked = reviewState?.disliked ?? false;
                        const likeCount = reviewState?.likeCount ?? review.likeCount ?? 0;
                        const dislikeCount =
                          reviewState?.dislikeCount ?? review.dislikeCount ?? 0;

                        return (
                          <div
                            key={review.id}
                            style={{
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              padding: "1rem",
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                            }}
                          >
                            {/* Top Row */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <div
                                style={{
                                  backgroundColor: "#199fcc",
                                  color: "#fff",
                                  borderRadius: "50%",
                                  width: 36,
                                  height: 36,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginRight: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {review.first_name ? review.first_name[0].toUpperCase() : "A"}
                              </div>

                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  {review.first_name || "Anonymous"}
                                </div>
                                <div style={{ color: "#199fcc" }}>
                                  {"★".repeat(review.rating)}
                                  {"☆".repeat(Math.max(0, 5 - review.rating))}
                                </div>
                              </div>

                              <div style={{ marginLeft: "auto", position: "relative" }}>
                                <FiMoreVertical
                                  style={{ cursor: "pointer", color: "#999" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDotsMenuOpen((prev) => (prev === review.id ? null : review.id));
                                  }}
                                />
                                {dotsMenuOpen === review.id && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "120%",
                                      right: 0,
                                      backgroundColor: "#fff",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                      borderRadius: 4,
                                      padding: "0.5rem 1rem",
                                      cursor: "pointer",
                                      zIndex: 10,
                                      whiteSpace: "nowrap",
                                    }}
                                    onClick={() => {
                                      // TODO: Add report logic here
                                      console.log("Report clicked for review id:", review.id);
                                      setDotsMenuOpen(null);
                                    }}
                                  >
                                    Report
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Comment */}
                            <p
                              style={{
                                marginTop: "0.75rem",
                                color: "#444",
                                fontSize: "0.95rem",
                                lineHeight: 1.4,
                              }}
                            >
                              {review.comment || review.text || "No comment provided."}
                            </p>

                            {/* Like/Dislike */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "0.5rem",
                                gap: "1rem",
                              }}
                            >
                              <button
                                onClick={() => handleLike(review.id)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: liked ? "#0a7f07" : "#444",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontWeight: 500,
                                }}
                              >
                                <FaThumbsUp /> {likeCount}
                              </button>
                              <button
                                onClick={() => handleDislike(review.id)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: disliked ? "#a00" : "#444",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontWeight: 500,
                                }}
                              >
                                <FaThumbsDown /> {dislikeCount}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Show more / less */}
                  {reviews.length > 4 && (
                    <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                      <button
                        onClick={handleShowToggle}
                        style={{
                          padding: "8px 20px",
                          border: "1.5px solid #035107",
                          borderRadius: 6,
                          backgroundColor: showAllReviews ? "#035107" : "transparent",
                          color: showAllReviews ? "white" : "#035107",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "1rem",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {showAllReviews ? "Show less" : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* CURRICULUM */}
          {activeTab === "curriculum" && (
            <>
              <h2 style={{ textAlign: "center", fontWeight: "bold" }}>Sections</h2>
              {curriculumData.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", margin: "2rem" }}>
                  No curriculum available. Please check your sections and lectures data.
                </p>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  {curriculumData.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginBottom: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        onClick={() =>
                          setExpandedCurriculum((prev) => ({
                            ...prev,
                            [sectionIndex]: !prev[sectionIndex],
                          }))
                        }
                        style={{
                          background: "#f7f7f7",
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        {`Section ${sectionIndex + 1} - ${section.name}`}
                        <span style={{ float: "right" }}>
                          {expandedCurriculum[sectionIndex] ? "▼" : "▶"}
                        </span>
                      </div>

                      {expandedCurriculum[sectionIndex] && (
                        <div style={{ padding: "12px 16px" }}>
                          {(showAllLectures[sectionIndex]
                            ? section.modules
                            : section.modules.slice(0, 2)
                          ).map((module) => {
                            const isPreview = module.preview;
                            const truncatedTitle = module.title
                              ? module.title.split(" ")[0] +
                                (module.title.split(" ").length > 1 ? "..." : "")
                              : "";
                            const isPlaying = previewPlaying[module.id] || false;

                            return (
                              <div
                                key={module.id}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  borderBottom: "1px solid #eee",
                                  padding: "12px 0",
                                  cursor: isPreview ? "pointer" : "default",
                                  opacity: 1,
                                  filter: "none",
                                }}
                                onClick={() => {
                                  if (isPreview) {
                                    setPreviewPlaying((prev) => ({
                                      ...prev,
                                      [module.id]: !prev[module.id],
                                    }));
                                  }
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    {isPreview ? (
                                      <FaUnlock style={{ color: "#006400" }} />
                                    ) : (
                                      <FaLock style={{ color: "#888" }} />
                                    )}
                                    <span style={{ color: "#333", fontWeight: "600" }}>
                                      {truncatedTitle}
                                      {isPreview && (
                                        <span
                                          style={{
                                            marginLeft: 8,
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            color: "#006400",
                                            backgroundColor: "#e6f2e6",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          Preview
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  <span style={{ color: "#555", fontSize: "0.9rem" }}>
                                    {module.duration}
                                  </span>
                                </div>

                                {isPlaying && module.video_url && (
                                  <div style={{ marginTop: "1rem" }}>
                                    <video
                                      width="100%"
                                      height="300"
                                      controls
                                      style={{ borderRadius: "6px", background: "#000" }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <source src={module.video_url} type="video/mp4" />
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {section.modules.length > 2 && (
                            <div style={{ marginTop: "12px" }}>
                              {showAllLectures[sectionIndex] ? (
                                <span
                                  role="button"
                                  onClick={() =>
                                    setShowAllLectures((prev) => ({
                                      ...prev,
                                      [sectionIndex]: false,
                                    }))
                                  }
                                  style={{
                                    color: "#007BFF",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  Show Less
                                </span>
                              ) : (
                                <span
                                  role="button"
                                  onClick={() =>
                                    setShowAllLectures((prev) => ({
                                      ...prev,
                                      [sectionIndex]: true,
                                    }))
                                  }
                                  style={{
                                    color: "#007BFF",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  Load More
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PRICING */}
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
                      boxShadow: "0 8px 24px rgba(52, 108, 143, 0.06)",
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
                            color: "#199fcc",
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
                      {enrolledTrackIds.includes(track.id) ? (
                        <div
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "green",
                            marginTop: 12,
                            fontSize: "16px",
                          }}
                        >
                          ✅ Already Enrolled
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(track.id)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#199fcc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* (Optional) Render the login modal ONCE, outside the map */}
              {showLoginModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div ref={loginModalRef} style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowLoginModal(false)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "transparent",
                        border: "none",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                      }}
                    >
                      &times;
                    </button>
                    <Login
                      show={showLoginModal}
                      onHide={() => setShowLoginModal(false)}
                      onLoginSuccess={handleLoginSuccess}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* SHARE */}
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

      {/* BUSINESS CTA */}
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
  container: { maxWidth: 1400, margin: "0 auto", padding: "0 20px" },
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
  },
  heroInfo: { flex: 1, minWidth: 280 },
  courseTitle: { fontSize: "2.5rem", fontWeight: 700 },
  courseCategory: { color: "#000", fontWeight: 600 },
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
  tabContent: { minHeight: 200 },
  loaderContainer: { padding: "4rem", textAlign: "center" },
  errorContainer: { padding: "4rem", textAlign: "center", color: "red" },
  shareSection: {
    marginTop: "3rem",
    textAlign: "center",
  },
  shareIcons: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "0.5rem",
  },
  shareIcon: { color: "#444", cursor: "pointer" },
  businessSection: {
    marginTop: "3rem",
    textAlign: "center",
    padding: "2rem",
    background: "#f9f9f9",
    borderRadius: "8px",
  },
  requestButton: {
    backgroundColor: "#199fcc",
    color: "white",
    padding: "0.75rem 1.5rem",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  reviewsGrid: {
  maxHeight: "500px",                
  overflowY: "auto",                 
  paddingRight: "10px",
  marginTop: "2rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
},
};





