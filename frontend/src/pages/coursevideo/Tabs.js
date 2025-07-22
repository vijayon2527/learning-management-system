// Tabs.js
import React from 'react';
import { BsSearch } from 'react-icons/bs';
import SideBar from './SideBar';
import './Tabs.css';
import Search from './tabs/Search';
import OverView from './tabs/OverView';
import Notes from './tabs/Notes';
import LearningTools from './tabs/LearningTools';
import Reviews from './tabs/Reviews';

const Tabs = React.forwardRef(
  (
    {
      activeTab,
      setActiveTab,
      sections,
      onLectureSelect,
      lecture,
      videoRef,
      authToken,
      course,
      currentUser,
      userChecked,        // <-- NEW
    },
    ref
  ) => {
    return (
      <div className="tab-container" ref={ref}>
        <div className="tab-scroll">
          <div className="tab-list">
            <button
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => setActiveTab('search')}
            >
              <BsSearch />
            </button>
            <button
              className={`d-block d-lg-none ${
                activeTab === 'coursecontent' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('coursecontent')}
            >
              Course Content
            </button>
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={activeTab === 'notes' ? 'active' : ''}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button
              className={activeTab === 'learning-tools' ? 'learning-tools' : ''}
              onClick={() => setActiveTab('learning-tools')}
            >
              Learning Tools
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'coursecontent' && (
            <SideBar sections={sections} onLectureSelect={onLectureSelect} />
          )}
          {activeTab === 'notes' && (
            <Notes
              lecture={lecture}
              videoRef={videoRef}
              authToken={authToken}
            />

          )}
          {activeTab === 'search' && <Search />}
          {activeTab === 'overview' && <OverView course={course} />}
          {activeTab === 'reviews' && (
             <Reviews courseId={course?.id} currentUser={currentUser} />)}
          {activeTab === "learning-tools" && <LearningTools />}
        </div>
      </div>
    );
  }
);

export default Tabs;
