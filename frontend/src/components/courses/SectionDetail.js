import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CButton,
  CTooltip,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft } from '@coreui/icons';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

import SectionUpdate from './SectionUpdate';
import SectionDeleteConfirm from './SectionDeleteConfirm';

/* utils */
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();

/* ─────────────────────────────── */
/* Video modal with double‑tap     */
const VideoModal = ({ visible, onClose, src, title, track }) => {
  const videoRef = useRef();

  const skip = (sec) => {
    if (videoRef.current) videoRef.current.currentTime += sec;
  };

  return (
    <CModal visible={visible} onClose={onClose} size="xl" scrollable>
      <CModalHeader onClose={onClose}>
        <CModalTitle>🎬 {title}</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {/* Video wrapper with invisible left / right zones */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxHeight: 400,
            marginBottom: '1rem',
          }}
        >
          <video
            ref={videoRef}
            src={src}
            controls
            style={{ width: '100%', borderRadius: 8 }}
          />

          {/* Left half – rewind 10 s */}
          <div
            onDoubleClick={() => skip(-10)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              cursor: 'pointer',
            }}
          />

          {/* Right half – forward 10 s */}
          <div
            onDoubleClick={() => skip(10)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50%',
              height: '100%',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Info */}
        <div className="text-center">
          <h5 className="fw-bold mb-1">{title}</h5>
          <div className="text-muted">📚 Track: {track || 'N/A'}</div>
          <div className="text-muted small mt-1">
            Double‑tap left to rewind 10 s, right to forward 10 s
          </div>
        </div>
      </CModalBody>
    </CModal>
  );
};

/* ─────────────────────────────── */
/* SectionDetail                   */
const SectionDetail = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  /* fetch section */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/api/courses/sections/${sectionId}/`
        );
        setSection(data);
      } catch {
        toast.error('Failed to load section');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sectionId]);

  /* media preview */
  const preview = (s) => {
    if (!s) return '—';

    if (s.media_type === 'video')
      return (
        <div
          style={{
            backgroundColor: '#000',
            padding: '1rem',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          onClick={() => setVideoOpen(true)}
        >
          <video
            src={s.file || s.external_url}
            style={{ width: '100%', maxWidth: 340, height: 200 }}
            muted
          />
        </div>
      );

    if (s.media_type === 'image')
      return (
        <img
          src={s.file || s.external_url || s.thumbnail}
          alt="preview"
          style={{
            width: '100%',
            maxWidth: 300,
            height: 300,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          }}
        />
      );

    if (s.media_type === 'file')
      return (
        <a href={s.file} target="_blank" rel="noreferrer">
          Download attached file
        </a>
      );

    if (s.media_type === 'link')
      return (
        <a href={s.external_url} target="_blank" rel="noreferrer">
          Open external link
        </a>
      );

    return 'No preview';
  };

  /* render */
  return (
    <CContainer fluid className="p-3 bg-light">
      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Section Details</h2>
        <CTooltip content="Go back">
          <CButton
            color="light"
            className="text-dark border border-secondary"
            onClick={() => navigate(-1)}
          >
            <CIcon icon={cilArrowLeft} className="me-2" />
            Back
          </CButton>
        </CTooltip>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <CSpinner />
        </div>
      ) : section ? (
        <CCard className="shadow-sm mb-4">
          <CCardBody>
            <CRow className="g-4">
              <CCol md={4} className="d-flex justify-content-center">
                {preview(section)}
              </CCol>

              <CCol md={8}>
                <h3 className="fw-bold mb-3">{section.title}</h3>

                <CRow className="g-3">
                  {[
                    ['ID', section.id],
                    ['Track', section.track_name || '—'],
                    ['Media Type', section.media_type],
                    [
                      'Status',
                      section.is_active ? (
                        <span style={{ color: '#198754' }}>Active</span>
                      ) : (
                        <span style={{ color: '#6c757d' }}>Inactive</span>
                      ),
                    ],
                  ].map(([label, value]) => (
                    <CCol sm={6} key={label}>
                      <div className="p-3 border rounded bg-light">
                        <strong>{label}</strong>
                        <p className="mb-0 text-muted">{value}</p>
                      </div>
                    </CCol>
                  ))}
                </CRow>

                <div className="mt-4 p-3 border rounded bg-light">
                  <strong>Overview</strong>
                  <p
                    className="mb-0"
                    style={{ whiteSpace: 'pre-wrap', color: '#555' }}
                    dangerouslySetInnerHTML={{
                      __html: stripHtml(section.overview),
                    }}
                  />
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      ) : (
        <div className="py-5 text-center">Section not found.</div>
      )}

      {/* Update */}
      {editOpen && (
        <SectionUpdate
          sectionId={sectionId}
          onClose={() => setEditOpen(false)}
          onUpdated={() => {
            setEditOpen(false);
            /* refresh */
            axiosInstance
              .get(`/api/courses/sections/${sectionId}/`)
              .then((res) => setSection(res.data));
          }}
        />
      )}

      {/* Delete */}
      {delOpen && (
        <SectionDeleteConfirm
          section={section}
          visible
          onClose={() => setDelOpen(false)}
          onDeleted={() => navigate(-1)}
        />
      )}

      {/* Video */}
      {section?.media_type === 'video' && (
        <VideoModal
          visible={videoOpen}
          onClose={() => setVideoOpen(false)}
          src={section.file || section.external_url}
          title={section.title}
          track={section.track_name}
        />
      )}
    </CContainer>
  );
};

export default SectionDetail;
