import React, { useState, useEffect, useRef } from 'react';
import VideoHeader from './VideoHeader';
import VideoPlayer from './VideoPlayer';
import Tabs from './Tabs';
import SideBar from './SideBar';
import coursesData from '../../data/courses.json';
import Footer from '../layout/partials/Footer.js';
import './CourseVideo.css';
import { BsChevronLeft} from 'react-icons/bs';

const CourseVideo = () => {
  const courseId = 1;
  const course = coursesData.find((c) => c.id === courseId);

  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [selectedLectureIndex, setSelectedLectureIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  const tabsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 980) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setActiveTab('notes');
  };

  const handleRestoreSidebar = () => {
    setShowSidebar(true);
  };

  const handleLectureSelect = (sectionIdx, lectureIdx) => {
    setSelectedSectionIndex(sectionIdx);
    setSelectedLectureIndex(lectureIdx);
  };

  return (
    <>
      <VideoHeader
        courseTitle={course?.title}
        sectionNumber={selectedSectionIndex + 1}
        lectureNumber={selectedLectureIndex + 1}
      />

      <div className="container-fluid course-video-body">
        <div className="row">
          <div className={`${showSidebar ? 'col-md-9' : 'col-12'} col-12 main-area position-relative d-flex flex-column`}>
            <div className="video-wrapper">
              <VideoPlayer />
              {!showSidebar && window.innerWidth > 980 && (
                <button className="restore-sidebar-btn" onClick={handleRestoreSidebar}>
                  <BsChevronLeft className='rsb-icon'/>
                </button>
              )}
            </div>

            <div ref={tabsRef} className="flex-grow-1">
              <Tabs
                ref={tabsRef}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sections={course.sections}
                onLectureSelect={handleLectureSelect}
              />

              {activeTab === 'course' && (
                <div className="mt-3">
                  <SideBar
                    sections={course.sections}
                    onLectureSelect={(sectionIdx, lectureIdx) => {
                      setSelectedSectionIndex(sectionIdx);
                      setSelectedLectureIndex(lectureIdx);
                    }}
                    onCloseSidebar={handleCloseSidebar}
                  />
                </div>
              )}
            </div>

            <Footer />
          </div>

          {showSidebar && window.innerWidth > 980 && (
            <div className="col-md-3 d-none d-md-block sidebar-area">
              <SideBar
                sections={course.sections}
                onLectureSelect={(sectionIdx, lectureIdx) => {
                  setSelectedSectionIndex(sectionIdx);
                  setSelectedLectureIndex(lectureIdx);
                }}
                onCloseSidebar={handleCloseSidebar}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseVideo;
