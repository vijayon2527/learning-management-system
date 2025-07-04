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

const Tabs = React.forwardRef(({ activeTab, setActiveTab, sections, onLectureSelect }, ref) => {
  return (
    <div className="tab-container" ref={ref}>
      <div className="tab-scroll">
        <div className="tab-list">
          <button className={activeTab === "search" ? "active" : ""} onClick={() => setActiveTab("search")}>
            <BsSearch />
          </button>
          <button
            className={`d-block d-lg-none ${activeTab === "coursecontent" ? "active" : ""}`}
            onClick={() => setActiveTab("coursecontent")}
          >
            Course Content
          </button>
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "notes" ? "active" : ""} onClick={() => setActiveTab("notes")}>Notes</button>
          <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>Reviews</button>
          <button className={activeTab === "learning-tools" ? "learning-tools" : ""} onClick={() => setActiveTab("learning-tools")}>learning Tools</button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'coursecontent' && <SideBar sections={sections} onLectureSelect={onLectureSelect} />}
        {activeTab === 'notes' && <div><Notes /></div>}
        {activeTab === 'search' && <div><Search /></div>}
        {activeTab === 'overview' && <div><OverView /></div>}
        {activeTab === 'reviews' && <div><Reviews /></div>}
        {activeTab === 'learning-tools' && <div><LearningTools /></div>}
      </div>
    </div>
  );
});

export default Tabs;
