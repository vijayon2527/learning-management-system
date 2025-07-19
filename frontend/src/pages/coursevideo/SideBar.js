// src/components/SideBar.js
import React, { useState, useEffect } from 'react';
import {
  BsChevronDown,
  BsChevronUp,
  BsX,
  BsPlayBtn,
  BsCheck2,
} from 'react-icons/bs';
import './SideBar.css';

const SideBar = ({
  sections = [],
  onLectureSelect,
  onCloseSidebar,
  activeLectureId,
  activeSectionId,
  autoExpandActive = true, // allow parent to control auto-open
}) => {
  const [openSectionId, setOpenSectionId] = useState(null);
  const [checkedLectures, setCheckedLectures] = useState({});

  /* Load watched checkmarks ----------------------------------- */
  useEffect(() => {
    const watched = JSON.parse(localStorage.getItem('checkedLectures')) || {};
    setCheckedLectures(watched);
  }, []);

  /* Auto-open active section (or first) ----------------------- */
  useEffect(() => {
    if (!sections.length) return;

    if (autoExpandActive && activeSectionId != null) {
      setOpenSectionId(activeSectionId);
    } else if (openSectionId == null) {
      setOpenSectionId(sections[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId, sections, autoExpandActive]);

  const toggleSection = (id) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  const toggleLectureCheckbox = (lectureId) => {
    setCheckedLectures((prev) => {
      const updated = { ...prev, [lectureId]: !prev[lectureId] };
      localStorage.setItem('checkedLectures', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-header">
        <h3 className="mb-0">Course content</h3>
        <BsX
          className="sidebar-close-icon"
          onClick={() => onCloseSidebar?.()}
        />
      </div>

      <div className="sidebar-content">
        {sections.map((section, sectionIndex) => {
          const totalLectures = section.lectures.length;
          const totalMinutes = section.lectures
            .map((lec) => parseInt(lec.duration || '0', 10))
            .reduce((a, b) => a + b, 0);

          const watchedCount = section.lectures.filter(
            (lec) => checkedLectures[lec.id]
          ).length;

          const isOpen = section.id == openSectionId; // loose == handles num/str
          const isActive = section.id == activeSectionId;

          return (
            <div
              key={section.id}
              className={`sidebar-section ${isActive ? 'active-section' : ''}`}
            >
              {/* HEADER: NOT CLICKABLE except icon */}
              <div className="sidebar-section-header">
                <strong className="sidebar-section-title">{section.name}</strong>
                <button
                  type="button"
                  className="accordion-icon-btn"
                  aria-expanded={isOpen}
                  aria-label={
                    isOpen
                      ? `Collapse ${section.name}`
                      : `Expand ${section.name}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(section.id);
                  }}
                >
                  {isOpen ? <BsChevronUp /> : <BsChevronDown />}
                </button>
              </div>

              <div className="sidebar-section-meta">
                {watchedCount} / {totalLectures} | {totalMinutes}min
              </div>

              {isOpen && (
                <div className="sidebar-lectures-wrapper">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const isLectureActive = lecture.id == activeLectureId;
                    return (
                      <div
                        key={lecture.id}
                        className={`sidebar-lecture ${
                          isLectureActive ? 'active-lecture' : ''
                        }`}
                        onClick={() =>
                          onLectureSelect?.(sectionIndex, lectureIndex)
                        }
                      >
                        <div className="lecture-top">
                          <div
                            className={`custom-checkbox ${
                              checkedLectures[lecture.id] ? 'checked' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLectureCheckbox(lecture.id);
                            }}
                          >
                            {checkedLectures[lecture.id] && (
                              <span className="tick">
                                <BsCheck2 />
                              </span>
                            )}
                          </div>
                          <span className="lecture-number">
                            {lectureIndex + 1}.
                          </span>
                          <span className="lecture-title">{lecture.name}</span>
                        </div>
                        <div className="lecture-bottom">
                          <div className="lecture-meta">
                            <BsPlayBtn className="play-icon" />
                            <span>{lecture.duration}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {!sections.length && (
          <div className="sidebar-empty">No sections available.</div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
