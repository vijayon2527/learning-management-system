import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CContainer, CRow, CCol, CSpinner } from '@coreui/react';
import { BsChevronLeft } from 'react-icons/bs';
import Header from '../../pages/layout/partials/Header';
import Footer from '../../pages/layout/partials/Footer';
import SideBar from './SideBar';
import Tabs from './Tabs';
import axiosInstance from '../../utils/axiosInstance';
import 'video-react/dist/video-react.css'; 
import {
  Player,
  ControlBar,
  PlayToggle,
  CurrentTimeDisplay,
  TimeDivider,
  DurationDisplay,
  ProgressControl,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  FullscreenToggle,
} from 'video-react';

import './CourseVideo.css';

const CourseVideoPage = () => {
const { courseSlug, trackSlug, sectionSlug, lectureSlug } = useParams();
  const navigate = useNavigate();

  const [lecture, setLecture] = useState(null);
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 980);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth > 980);
  const [activeTab, setActiveTab] = useState(() =>
    window.innerWidth > 980 ? 'notes' : 'coursecontent'
  );

  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null); // this points to <Player />


  useEffect(() => {
  const interval = setInterval(() => {
    const realVideo = playerRef.current?.video?.video;
    if (realVideo) {
      videoRef.current = realVideo;
      clearInterval(interval);
    }
  }, 300);

  return () => clearInterval(interval);
}, []);


  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token && !axiosInstance.defaults.headers.common.Authorization) {
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        const res = await axiosInstance.get('/api/users/me/');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setUserChecked(true);
      }
    };
    fetchUser();
  }, []);

  // Fetch lecture + section data
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [lectureRes, sectionRes, allSectionsRes, courseRes] = await Promise.all([
axiosInstance.get(`/api/courses/lectures/${lectureSlug}/`),
  axiosInstance.get(`/api/courses/sections/${sectionSlug}/`),
  axiosInstance.get(`/api/courses/public-courses/${courseSlug}/track-content/?track_slug=${trackSlug}`),
  axiosInstance.get(`/api/courses/public-courses/${courseSlug}/`),
      ]);
      setLecture(lectureRes.data);
      setSection(sectionRes.data);
      setAllSections(allSectionsRes.data);
      setCourse(courseRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (courseSlug && sectionSlug && lectureSlug && trackSlug) fetchData();
}, [courseSlug, sectionSlug, lectureSlug, trackSlug]);


  // Update video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(Number(percent.toFixed(2)));
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [videoRef]);

  // Add to recently watched
 useEffect(() => {
  if (course && lecture && section && courseSlug && user?.id) {
    const currentLecture = {
      title: lecture.name,
      thumbnail: lecture.course_logo || '/default-thumbnail.jpg',
      watchedAt: new Date().toISOString(),
      courseSlug,
      trackSlug,
      sectionId: section.id,
      sectionName: section.name, // NEW
      courseName: course?.title || course?.name || "Unknown Course", // NEW
      lectureId: lecture.id,
      progress: videoRef.current?.currentTime || 0,
    };

    const key = `recentlyWatched_${user.id}`;
    let watched = JSON.parse(localStorage.getItem(key)) || [];

    // Remove any duplicate entry for the same lecture
    watched = watched.filter((item) => item.lectureId !== currentLecture.lectureId);

    // Add the new lecture to the beginning of the array
    watched.unshift(currentLecture);

    // Keep only the latest 4
    watched = watched.slice(0, 4);

    localStorage.setItem(key, JSON.stringify(watched));
  }
}, [lecture, section, courseSlug, progress, user]);


  const handleLectureSelect = (sectionIndex, lectureIndex) => {
  const selectedSection = allSections[sectionIndex];
  const selectedLecture = selectedSection?.lectures?.[lectureIndex];
  if (selectedLecture) {
    navigate(
      `/course-video/${courseSlug}/${trackSlug}/${selectedSection.slug}/${selectedLecture.slug}`
    );
  }
};

  const authUser = user ? { id: user.id, first_name: user.first_name } : null;
  const handleRestoreSidebar = () => setShowSidebar(true);

  return (
    <>
      <Header />
      <CContainer fluid className="py-4">
        <CRow>
          <CCol md={showSidebar && isDesktop ? 9 : 12}
          >
              <div className={`course-video-shell position-relative mb-4 ${!showSidebar ? 'no-sidebar' : ''}`}>
              <div className="video-aspect rounded shadow-sm position-relative">
                {lecture?.video ? (
                <Player
                  ref={playerRef}
                  playsInline
                  autoPlay
                  fluid={false}
                  width="100%"
                  height="100%"
                  src={lecture.video}
                  onReady={() => {
                    const realVideo = playerRef.current?.video?.video;
                    if (realVideo) {
                      videoRef.current = realVideo;
                    }
                  }}
                >
                  <ControlBar autoHide={false}>
                    <PlayToggle />
                    <CurrentTimeDisplay />
                    <TimeDivider />
                    <DurationDisplay />
                    <ProgressControl />
                    <PlaybackRateMenuButton rates={[2, 1.5, 1, 0.75]} order={7.1} />
                    <VolumeMenuButton vertical />
                    <FullscreenToggle />
                  </ControlBar>
                </Player>
                ) : loading ? (
                  <div className="loading-overlay">
                    <CSpinner color="light" />
                    <div className="mt-3">Loading video...</div>
                  </div>
                ) : (
                  <div className="loading-overlay">🎬 No video available.</div>
                )}
              </div>

              {!showSidebar && isDesktop && (
                <div className="restore-sidebar-middle">
                  <button className="restore-sidebar-btn" onClick={handleRestoreSidebar}>
                    <BsChevronLeft />
                  </button>
                </div>
              )}
            </div>

            <Tabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sections={allSections}
              onLectureSelect={handleLectureSelect}
              lecture={lecture}
              videoRef={videoRef}
              authToken={localStorage.getItem('access_token')}
              course={course}
              currentUser={authUser}
              userChecked={userChecked}
            />

            {activeTab === 'coursecontent' && (
              <div className="mt-3">
             <SideBar
              sections={allSections}
              onLectureSelect={handleLectureSelect}
              activeLectureId={lecture?.id}
              activeSectionId={section?.id}
            />
              </div>
            )}
          </CCol>

          {isDesktop && showSidebar && (
          <CCol md={3} className="px-3">
            <div className="sidebar-wrapper">
              <SideBar
                sections={allSections}
                onLectureSelect={handleLectureSelect}
                activeLectureId={lecture?.id}      // <-- pass numeric ID
                activeSectionId={section?.id}      // <-- pass numeric ID
                onCloseSidebar={() => setShowSidebar(false)}
              />
            </div>
          </CCol>
        )}
        </CRow>
      </CContainer>
      <Footer />
    </>
  );
};

export default CourseVideoPage;
