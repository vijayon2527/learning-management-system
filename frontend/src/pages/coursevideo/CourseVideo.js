
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CContainer, CRow, CCol, CSpinner } from '@coreui/react';
import { BsChevronLeft } from 'react-icons/bs';
import Header from '../../pages/layout/partials/Header';
import Footer from '../../pages/layout/partials/Footer';
import SideBar from './SideBar';
import Tabs from './Tabs';
import axiosInstance from '../../utils/axiosInstance';

// Import the CSS that enforces the fixed 16:9 shell.
// import './CourseVideoPage.css';

const DESKTOP_BREAKPOINT = 980;

const CourseVideoPage = () => {
  const { courseSlug, sectionSlug, lectureSlug } = useParams();
  const navigate = useNavigate();

  const [lecture, setLecture] = useState(null);
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true); // network/loading state only

  // sidebar responsive
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > DESKTOP_BREAKPOINT);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth > DESKTOP_BREAKPOINT);

  const [activeTab, setActiveTab] = useState(() => {
  return window.innerWidth > DESKTOP_BREAKPOINT ? 'notes' : 'coursecontent';
});
  const tabsRef = useRef(null);
  const videoRef = useRef(null);

  // --- Fetch current lecture / section / course data --------------------------------
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lectureRes, sectionRes, allSectionsRes, courseRes] = await Promise.all([
          axiosInstance.get(`/api/courses/lectures/${lectureSlug}/`),
          axiosInstance.get(`/api/courses/sections/${sectionSlug}/`),
          axiosInstance.get(`/api/courses/sections/?course_slug=${courseSlug}`),
          axiosInstance.get(`/api/courses/public-courses/${courseSlug}/`),
        ]);
        if (cancelled) return;
        setLecture(lectureRes.data);
        setSection(sectionRes.data);
        setAllSections(allSectionsRes.data);
        setCourse(courseRes.data);
      } catch (err) {
        if (!cancelled) console.error('Error loading data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [courseSlug, sectionSlug, lectureSlug]);

  // --- Responsive sidebar -----------------------------------------------------------
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth > DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      setShowSidebar(desktop); // auto-hide on mobile resize
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setActiveTab('notes');
  };
  const handleRestoreSidebar = () => setShowSidebar(true);

  useEffect(() => {
  const onResize = () => {
    const desktop = window.innerWidth > DESKTOP_BREAKPOINT;
    setIsDesktop(desktop);
    setShowSidebar(desktop);

    // Switch tab dynamically when crossing breakpoint
    setActiveTab(desktop ? 'notes' : 'coursecontent');
  };
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);


  // --- Recently watched tracking ----------------------------------------------------
  useEffect(() => {
    if (lecture && section && courseSlug) {
      const currentLecture = {
        title: lecture.name,
        thumbnail: lecture.thumbnail || '/default-thumbnail.jpg',
        watchedAt: new Date().toISOString(),
        courseSlug,
        sectionId: section.id,
        lectureId: lecture.id,
      };
      let watched = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
      watched = watched.filter(item => item.lectureId !== currentLecture.lectureId);
      watched.unshift(currentLecture);
      watched = watched.slice(0, 4);
      localStorage.setItem('recentlyWatched', JSON.stringify(watched));
    }
  }, [lecture, section, courseSlug]);

  // --- Scroll to top when lecture changes ------------------------------------------
  useEffect(() => {
    if (lecture) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lecture]);

  // --- Lecture selection ------------------------------------------------------------
  const handleLectureSelect = (sectionIndex, lectureIndex) => {
    const selectedSection = allSections[sectionIndex];
    const selectedLecture = selectedSection.lectures[lectureIndex];
    // IMPORTANT: Do NOT blank state here; just navigate. Keeps width steady.
    navigate(`/course-video/${courseSlug}/${selectedSection.id}/${selectedLecture.id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // --- Render -----------------------------------------------------------------------
  return (
    <>
      <Header />

      <div className="breadcrumb-bar bg-dark text-white p-3 px-4 d-flex align-items-center justify-content-between">
        <div>
          <strong className="d-inline d-md-inline">AgpLms</strong>
          &nbsp;|&nbsp;
          <span>{course?.title || courseSlug}</span>
          <span className="d-none d-md-inline">
            &nbsp;›&nbsp;<span>Section {section?.name}</span>
            &nbsp;›&nbsp;<span>{lecture?.name || 'Lecture'}</span>
          </span>
        </div>
      </div>


      <CContainer fluid className="py-4">
        <CRow>
          <CCol md={showSidebar && isDesktop ? 9 : 12}>
            {/* --- Stable Video Shell ------------------------------------------------ */}
            <div className="course-video-shell position-relative mb-4">
              <div className="video-aspect rounded shadow-sm">
                {lecture?.video && (
                  <video
                    ref={videoRef}
                    key={lectureSlug} // force reload when slug changes
                    controls
                    autoPlay
                    src={lecture.video}
                    onTimeUpdate={(e) => {
                      const currentTime = e.target.currentTime;
                      const duration = e.target.duration;
                      if (lecture && section && courseSlug && duration > 0) {
                        const currentLecture = {
                          title: lecture.name,
                          thumbnail: lecture.thumbnail || '/default-thumbnail.jpg',
                          watchedAt: new Date().toISOString(),
                          courseSlug,
                          sectionId: section.id,
                          lectureId: lecture.id,
                          progress: (currentTime / duration) * 100,
                        };
                        let watched = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
                        watched = watched.filter(item => item.lectureId !== currentLecture.lectureId);
                        watched.unshift(currentLecture);
                        watched = watched.slice(0, 4);
                        localStorage.setItem('recentlyWatched', JSON.stringify(watched));
                      }
                    }}
                  />
                )}
                {loading && (
                  <div className="loading-overlay">
                    <CSpinner color="light" />
                    <div className="mt-3">Loading video...</div>
                  </div>
                )}
                {!loading && !lecture?.video && (
                  <div className="loading-overlay">🎬 No video available.</div>
                )}
              </div>

              {/* Restore sidebar button (desktop only, hidden if sidebar shown) */}
              {!showSidebar && isDesktop && (
                <div className="restore-sidebar-middle">
                  <button className="restore-sidebar-btn" onClick={handleRestoreSidebar}>
                    <BsChevronLeft />
                  </button>
                </div>
              )}
            </div>

            {/* --- Tabs + In-content sidebar when tab == course --------------------- */}
            <div ref={tabsRef} className="flex-grow-1">
              <Tabs
                ref={tabsRef}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sections={allSections}
                onLectureSelect={handleLectureSelect}
                lecture={lecture}
                videoRef={videoRef}
                authToken={localStorage.getItem('access_token')}
                course={course}
              />

              {activeTab === 'course' && (
                <div className="mt-3">
                  <SideBar
                    sections={allSections}
                    onLectureSelect={handleLectureSelect}
                    onCloseSidebar={handleCloseSidebar}
                    activeLectureId={parseInt(lectureSlug)}
                    activeSectionId={parseInt(sectionSlug)}
                    autoExpandActive={true}
                  />
                </div>
              )}
            </div>
          </CCol>

          {/* --- Persistent sidebar (desktop) -------------------------------------- */}
          {showSidebar && isDesktop && (
            <CCol md={3} className="px-3">
              <SideBar
                sections={allSections}
                onLectureSelect={handleLectureSelect}
                onCloseSidebar={handleCloseSidebar}
                activeLectureId={parseInt(lectureSlug)}
                activeSectionId={parseInt(sectionSlug)}
              />
            </CCol>
          )}
        </CRow>
      </CContainer>

      <Footer />
    </>
  );
};

export default CourseVideoPage;

