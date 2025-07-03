import React, { useState, useRef, useEffect } from 'react';
import {
  BsStar,
  BsShareFill,
  BsBell,
  BsPersonCircle,
  BsHeart,
  BsHeartFill,
  BsBook,
  BsGear,
  BsList,
  BsXLg,
  BsArrowLeft
} from 'react-icons/bs';
import './VideoHeader.css';
import RatingModal from './RatingModal';

const VideoHeader = ({ courseTitle, sectionNumber, lectureNumber }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const dropdownRef = useRef();
  const mobileMenuRef = useRef();

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {showModal && (
        <RatingModal
          onClose={closeModal}
          onSubmit={() => {
            setHasRated(true);
            closeModal();
          }}
        />
      )}

      <div className="course-video-header">
        <div className="cvh-left">
          <span className="cvh-logo-text">
            <span className="cvh-logo-name">AgpLms</span>
            <span className="cvh-logo-back"><BsArrowLeft size={20} /></span>
          </span>
          <div className="breadcrumb-path">
            <span className="breadcrumb-first">{courseTitle || 'Course'}</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span>Section {sectionNumber}</span>
            <span className="breadcrumb-separator">{'>'}</span>
            <span>Lecture {lectureNumber}</span>
          </div>
        </div>

        <div className="cvh-right desktop-actions">
          {!hasRated && (
            <span className="cvh-action" onClick={openModal}>
              <BsStar size={14} /> Leave a rating
            </span>
          )}

          <span className="cvh-action share">Share <BsShareFill /></span>
          <span className="cvh-action"><BsBell size={20} /></span>

          <div className="profile-wrapper" ref={dropdownRef}>
            <span className="cvh-action profile-avatar" onClick={toggleDropdown}>
              <img src="/assets/images/avatars/1.jpg" alt="User Avatar" />
            </span>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-item top"><BsPersonCircle /> My Dashboard</div>
                <div className="dropdown-item"><BsBell /> Notifications</div>
                {!hasRated && (
                  <div className="dropdown-item" onClick={openModal}><BsStar /> Leave Rating</div>
                )}
                <div className="dropdown-item" onClick={() => setIsFavorite(prev => !prev)}>
                  {isFavorite ? (
                    <><BsHeartFill style={{ color: '#f96969' }} /> Unfavorite this Course</>
                  ) : (
                    <><BsHeart /> Favorite this Course</>
                  )}
                </div>
                <div className="dropdown-item"><BsShareFill /> Share</div>
                <div className="dropdown-item"><BsBook /> My Learnings</div>
                <div className="dropdown-item"><BsGear /> Settings</div>
              </div>
            )}
          </div>
        </div>

        {/* Hamburger Icon */}
        <div className="cvh-hamburger" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <BsXLg size={20} /> : <BsList size={24} />}
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer" ref={mobileMenuRef}>
            <div className="mobile-drawer-header">
              <div className="mobile-avatar">
                <img src="/assets/images/avatars/1.jpg" alt="User Avatar" />
              </div>
              <BsXLg className="drawer-close-icon" onClick={() => setMobileMenuOpen(false)} />
            </div>

            <div className="dropdown-item top"><BsPersonCircle /> My Dashboard</div>
            <div className="dropdown-item"><BsBell /> Notifications</div>
            {!hasRated && (
              <div className="dropdown-item" onClick={openModal}><BsStar /> Leave Rating</div>
            )}
            <div className="dropdown-item" onClick={() => setIsFavorite(prev => !prev)}>
              {isFavorite ? (
                <><BsHeartFill style={{ color: '#f96969' }} /> Unfavorite this Course</>
              ) : (
                <><BsHeart /> Favorite this Course</>
              )}
            </div>
            <div className="dropdown-item"><BsShareFill /> Share</div>
            <div className="dropdown-item"><BsBook /> My Learnings</div>
            <div className="dropdown-item"><BsGear /> Settings</div>
          </div>

        )}



      </div>
    </>
  );
};

export default VideoHeader;
