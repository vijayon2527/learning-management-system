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
  autoExpandActive = true,   // NEW: allows parent to turn off auto-open if ever needed
}) => {
  const [openSectionId, setOpenSectionId] = useState(null);
  const [checkedLectures, setCheckedLectures] = useState({});

  /* -------------------- load watched checkmarks -------------------- */
  useEffect(() => {
    const watched = JSON.parse(localStorage.getItem('checkedLectures')) || {};
    setCheckedLectures(watched);
  }, []);

  useEffect(() => {
    if (!sections.length) return;

    if (autoExpandActive && activeSectionId != null) {
      setOpenSectionId(activeSectionId);
    } else if (openSectionId == null) {
      // initial mount fallback
      setOpenSectionId(sections[0].id);
    }
  }, [activeSectionId, sections, autoExpandActive]); // deliberately omit openSectionId to allow reset

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

          // loose equality so number vs string both match
          const isOpen = section.id == openSectionId;
          const isActive = section.id == activeSectionId;

          return (
            <div
              key={section.id}
              className={`sidebar-section ${isActive ? 'active-section' : ''}`}
            >
              <div className="sidebar-section-header">
                <strong>{section.name}</strong>
                <span
                  className="accordion-icon"
                  onClick={() => toggleSection(section.id)}
                >
                  {isOpen ? <BsChevronUp /> : <BsChevronDown />}
                </span>
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
