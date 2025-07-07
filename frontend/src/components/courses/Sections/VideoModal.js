// src/components/sections/VideoModal.js
import React, { useRef } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
} from '@coreui/react';

const VideoModal = ({ visible, onClose, videoSrc, title, track }) => {
  const videoRef = useRef();

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <CModal visible={visible} onClose={onClose} size="xl">
      <CModalHeader>
        <CModalTitle>🎬 {title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="text-center mb-3">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            style={{ width: '100%', maxHeight: 500, borderRadius: 8 }}
          />
        </div>

        <div className="d-flex justify-content-center gap-3 mb-3">
          <CButton color="dark" onClick={() => skip(-10)}>
            ⏪ Back 10s
          </CButton>
          <CButton color="dark" onClick={() => skip(-5)}>
            ◀ Back 5s
          </CButton>
          <CButton color="dark" onClick={() => skip(5)}>
            ▶ Forward 5s
          </CButton>
          <CButton color="dark" onClick={() => skip(10)}>
            ⏩ Forward 10s
          </CButton>
        </div>

        <div className="text-center text-muted">
          <p className="mb-1"><strong>Title:</strong> {title}</p>
          <p><strong>Track:</strong> {track}</p>
        </div>
      </CModalBody>
    </CModal>
  );
};

export default VideoModal;
