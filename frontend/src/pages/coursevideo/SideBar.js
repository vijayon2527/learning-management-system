import React, { useState } from 'react';
import {
  BsChevronDown,
  BsChevronUp,
  BsX,
  BsFolder,
  BsPlayBtn,
  BsCheck2
} from 'react-icons/bs';
import './SideBar.css';

const SideBar = ({ sections, onLectureSelect, onCloseSidebar }) => {
  const [openSections, setOpenSections] = useState({});
  const [checkedLectures, setCheckedLectures] = useState({});

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleLectureCheckbox = (lectureId) => {
    setCheckedLectures((prev) => ({
      ...prev,
      [lectureId]: !prev[lectureId],
    }));
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-header">
        <h3>Course content</h3>
        <BsX className="sidebar-close-icon" onClick={() => onCloseSidebar?.()} />
      </div>

      <div className="sidebar-content">
        {sections.map((section, sectionIndex) => {
          const totalLectures = section.lectures.length;
          const totalMinutes = section.lectures
            .map((lec) => parseInt(lec.duration))
            .reduce((a, b) => a + b, 0);

          const watchedCount = section.lectures.filter(
            (lec) => checkedLectures[lec.id]
          ).length;

          const isOpen = openSections[section.id];

          return (
            <div className="sidebar-section" key={section.id}>
              <div
                className="sidebar-section-header"
                onClick={() => toggleSection(section.id)}
              >
                <strong>{section.title}</strong>
                <span>{isOpen ? <BsChevronUp /> : <BsChevronDown />}</span>
              </div>

              <div className="sidebar-section-meta">
                {watchedCount} / {totalLectures} | {totalMinutes}min
              </div>

              {isOpen && (
                <div className="sidebar-lectures-wrapper">
                  {section.lectures.map((lecture, lectureIndex) => (
                    <div
                      key={lecture.id}
                      className="sidebar-lecture"
                      onClick={() => onLectureSelect(sectionIndex, lectureIndex)}
                    >
                      <div className="lecture-top">
                        <div
                          className={`custom-checkbox ${checkedLectures[lecture.id] ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent triggering lecture select
                            toggleLectureCheckbox(lecture.id);
                          }}
                        >
                          {checkedLectures[lecture.id] && (
                            <span className="tick"><BsCheck2 /></span>
                          )}
                        </div>

                        <span className="lecture-number">{lectureIndex + 1}.</span>
                        <span className="lecture-title">{lecture.title}</span>
                      </div>

                      <div className="lecture-bottom">
                        <div className="lecture-meta">
                          <BsPlayBtn className='play-icon' />
                          <span>{lecture.duration}</span>
                        </div>
                        <button className="resources-btn">
                          <BsFolder size={14} /> Resources
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
