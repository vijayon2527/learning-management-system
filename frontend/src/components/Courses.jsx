import React, { useEffect, useState } from "react";
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CAlert,
  CBadge,
  CButton,
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from "@coreui/react";
import axiosInstance from "../utils/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faFileAlt, faChevronDown, faChevronUp, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const Courses = () => {
  const [courseData, setCourseData] = useState({ course: {}, curriculum: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const response = await axiosInstance.get("/api/course/courses/4/curriculum/");
        setCourseData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculum();
  }, []);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  if (loading) return <CSpinner color="primary" />;
  if (error) return <CAlert color="danger">{error}</CAlert>;
console.log(courseData.curriculum[0].submodules[0].topics[0].materials[0].content_object.file);
  return (
    <CContainer fluid className="p-0 udemy-style">
      <CRow className="m-0">
        {/* Main Content Area */}
        <CCol md={8} className="p-0">
          {courseData ? (
            <div className="video-container">
              <video controls className="w-100" poster="https://cdn.pixabay.com/photo/2016/05/27/08/51/mobile-phone-1419275_1280.jpg">
            <source src="https://cdn.pixabay.com/video/2025/01/19/253436_large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
            </video>


            </div>
          ) : (
            <div className="course-preview text-center p-5 bg-dark text-white">
              <h2>{courseData.course.title}</h2>
              <p className="lead">{courseData.course.description}</p>
            </div>
          )}
          
          <CTabs activeTab={activeTab} onActiveTabChange={setActiveTab}>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink data-tab="content">Course Content</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="resources">Resources</CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="qa">Q&A</CNavLink>
              </CNavItem>
            </CNav>
            <CTabContent>
              <CTabPane data-tab="content" className="p-4">
                <h3>Course Curriculum</h3>
                <div dangerouslySetInnerHTML={{ __html: courseData.course.syllabus }} />
              </CTabPane>
              <CTabPane data-tab="resources" className="p-4">
                <h3>Downloadable Resources</h3>
                {/* Add resource list here */}
              </CTabPane>
              <CTabPane data-tab="qa" className="p-4">
                <h3>Questions & Answers</h3>
                {/* Add Q&A section here */}
              </CTabPane>
            </CTabContent>
          </CTabs>
        </CCol>

        {/* Curriculum Sidebar */}
        <CCol md={4} className="p-0 curriculum-sidebar">
          <CCard className="h-100 rounded-0">
            <div className="p-3 bg-light border-bottom">
              <h5 className="mb-0">Course Content</h5>
              <small className="text-muted">{courseData.curriculum.length} sections • 25 lectures</small>
            </div>
            
            <CListGroup flush style={{ maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
              {courseData.curriculum.map((module) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  submodules={module.submodules}
                  topics={module.topics}
                  expanded={expandedModules.has(module.id)}
                  onToggle={() => toggleModule(module.id)}
                  onSelect={setSelectedContent}
                />
              ))}
            </CListGroup>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

const ModuleItem = ({ module, submodules = [], topics = [], expanded, onToggle, onSelect }) => (
  <CListGroupItem className="border-0 rounded-0">
    <div className="d-flex justify-content-between align-items-center p-2 bg-white">
      <span className="fw-bold">{module.title}</span>
      <CButton color="link" onClick={onToggle}>
        <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
      </CButton>
    </div>
    
    {expanded && (
      <div className="module-content">
        {topics.map((topic) => (
          <TopicItem key={topic.id} topic={topic} onSelect={onSelect} />
        ))}
        {submodules.map((submoduleItem) => (
          <SubmoduleItem key={submoduleItem.module.id} submodule={submoduleItem} onSelect={onSelect} />
        ))}
      </div>
    )}
  </CListGroupItem>
);

const SubmoduleItem = ({ submodule, onSelect }) => (
  <div className="submodule ps-3">
    <div className="d-flex align-items-center p-2 bg-light">
      <span className="fw-bold">{submodule.module.title}</span>
    </div>
    <CListGroup flush>
      {submodule.topics.map((topic) => (
        <TopicItem key={topic.id} topic={topic} onSelect={onSelect} />
      ))}
      {submodule.submodules.map((nestedSub) => (
        <SubmoduleItem key={nestedSub.module.id} submodule={nestedSub} onSelect={onSelect} />
      ))}
    </CListGroup>
  </div>
);

const TopicItem = ({ topic, onSelect }) => (
  <CListGroupItem 
    className="curriculum-item border-0" 
    action 
    onClick={() => onSelect(topic.materials?.[0])}
  >
    <div className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <FontAwesomeIcon 
          icon={topic.materials?.[0]?.type === 'Video' ? faPlayCircle : faFileAlt} 
          className="text-muted me-2" 
        />
        <span>{topic.title}</span>
      </div>
      <div className="d-flex align-items-center">
        {topic.completed && (
          <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
        )}
        <small className="text-muted">{topic.estimated_duration}</small>
      </div>
    </div>
    {topic.materials?.length > 1 && (
      <div className="ms-4 mt-1">
        {topic.materials.slice(1).map((material) => (
          <div 
            key={material.id} 
            className="d-flex align-items-center py-1 hover-bg"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(material);
            }}
          >
            <FontAwesomeIcon 
              icon={material.type === 'Video' ? faPlayCircle : faFileAlt} 
              className="text-muted me-2 fs-smaller" 
            />
            <span className="fs-smaller">{material.title}</span>
          </div>
        ))}
      </div>
    )}
  </CListGroupItem>
);

// Add CSS Styles
const styles = `
/* Add these to the style tag */
.udemy-style .nav-tabs .nav-link.active {
  border-color: #5624d0;
  color: #5624d0;
}

.udemy-style .course-preview {
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.udemy-style video {
  height: 100%;
  object-fit: cover;
}
  
.udemy-style .curriculum-sidebar {
  border-left: 1px solid #dee2e6;
  background: #f7f9fa;
}

.udemy-style .video-container {
  background: #000;
  height: 450px;
}

.udemy-style .curriculum-item {
  padding: 0.75rem 1.25rem;
  border-radius: 0!important;
}

.udemy-style .curriculum-item:hover {
  background-color: #f8f9fa;
}

.udemy-style .module-content {
  background: #fff;
  border-bottom: 1px solid #dee2e6;
}

.udemy-style .fs-smaller {
  font-size: 0.9rem;
}

.udemy-style .hover-bg:hover {
  background-color: rgba(0,0,0,0.03);
}
`;

export default () => (
  <>
    <style>{styles}</style>
    <Courses />
  </>
);