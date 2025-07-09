import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import {
  CContainer, CCard, CCardBody, CButton, CTooltip, CSpinner,
  CCollapse, CModal, CModalHeader, CModalBody,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilArrowLeft, cilPlus, cilChevronBottom, cilChevronTop, cilPen, cilTrash,
} from '@coreui/icons';
import { toast } from 'react-toastify';
import CreateLecture from './Lectures/LectureCreate';
import LectureDeleteConfirm from './Lectures/LectureDeleteConfirm';
import LectureUpdate from './Lectures/LectureUpdate';
import axiosInstance from '../../utils/axiosInstance';

const ItemType = 'LECTURE';

const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').trim();


const DraggableRow = ({ lecture, index, moveLecture, children }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveLecture(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { type: ItemType, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0 : 1,
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        transition: 'transform 0.25s ease, box-shadow 0.2s',
        boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
        zIndex: isDragging ? 1000 : 'auto',
        position: isDragging ? 'relative' : 'static',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #dee2e6',
        marginBottom: '8px',
      }}
    >
      {children}
    </div>
  );
};


const Info = ({ label, value, badge }) => (
  <div>
    <span className="text-muted small">{label}</span>
    <div className={`fw-semibold ${badge ? `text-${badge}` : ''}`}>{value}</div>
  </div>
);

const SectionDetail = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLectures, setShowLectures] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [isOrderChanged, setIsOrderChanged] = useState(false);


  const openModal = (action, lecture = null) => {
    setModalAction(action);
    setSelectedLecture(lecture);
  };

  const showVideo = (url, lecture) => {
  setCurrentVideoUrl(url);
  setSelectedLecture(lecture); // Set selected lecture
  setVideoModalOpen(true);
};



  const closeModal = () => {
    setModalAction(null);
    setSelectedLecture(null);
  };

  


  const fetchAll = async () => {
    setLoading(true);
    try {
      const sectionRes = await axiosInstance.get(`/api/courses/sections/${sectionId}/`);
      const lecturesRes = await axiosInstance.get(`/api/courses/lectures/?section=${sectionId}`);
      setSection(sectionRes.data);
      setLectures(lecturesRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [sectionId]);

  const moveLecture = (fromIndex, toIndex) => {
  const updatedLectures = [...lectures];
  const [movedItem] = updatedLectures.splice(fromIndex, 1);
  updatedLectures.splice(toIndex, 0, movedItem);
  setLectures(updatedLectures);
  setIsOrderChanged(true); // 🔥 Trigger button visibility
};


  const saveOrder = async () => {
    try {
      await axiosInstance.post('/api/courses/lectures/reorder/', {
        order: lectures.map((lec, index) => ({ id: lec.id, order: index + 1 })),
      });
      toast.success('Lecture order saved successfully!');
    } catch {
      toast.error('Failed to save order');
    }
  };

  const fmtDuration = (iso) => {
    if (!iso) return '—';
    const [h, m, s] = iso.split(':').map(Number);
    return `${h ? h + ' hr ' : ''}${m} min ${Math.round(s)}s`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="d-flex justify-content-end p-2 border-bottom bg-white">
        <CTooltip content="Go back">
          <CButton color="light" className="text-dark border border-secondary" onClick={() => navigate(-1)}>
            <CIcon icon={cilArrowLeft} className="me-2" /> Back
          </CButton>
        </CTooltip>
      </div>

      <CContainer fluid className="p-3 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          {section && <h2 className="m-0">Section – <span className="text-muted">{section.name}</span></h2>}
          <CTooltip content="Add a new lecture">
            <CButton color="primary" onClick={() => setModalOpen(true)}>
              <CIcon icon={cilPlus} className="me-1" /> Add Lecture
            </CButton>
          </CTooltip>
        </div>

        {loading ? (
          <div className="text-center py-5"><CSpinner /></div>
        ) : section ? (
          <>
            <CCard className="shadow-sm mb-3">
              <CCardBody className="py-2 px-3">
                <div className="d-flex flex-wrap align-items-start" style={{ gap: '2rem' }}>
                  <Info label="📚 Track" value={section.track_name} />
                  <Info label="🎓 Course" value={section.course_name} />
                  <Info label="⚙️ Status" value={section.is_locked ? 'Locked' : 'Unlocked'} badge={section.is_locked ? 'danger' : 'success'} />
                  <Info label="📅 Created" value= {new Date(section.created_at).toLocaleDateString('en-GB')} />
                </div>
                {section.description && (
                  <div className="mt-4">
                    <span className="text-muted small">Description</span>
                    <div className="p-2 mt-1 bg-light rounded" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                      {stripHtml(section.description)}
                    </div>
                  </div>
                )}
              </CCardBody>
            </CCard>

            <CCard className="shadow-sm">
              <div className="d-flex justify-content-between align-items-center p-3" style={{ cursor: 'pointer' }} onClick={() => setShowLectures(!showLectures)}>
                <h3 className="mb-0 fw-bold">Lectures <span className="badge bg-secondary">{lectures.length}</span></h3>
                <CIcon icon={showLectures ? cilChevronTop : cilChevronBottom} size="lg" />
              </div>

              <CCollapse visible={showLectures}>
                <CCardBody>
                  {lectures.length === 0 ? (
                    <p className="text-muted text-center mb-0">No lectures available.</p>
                  ) : (
                    <>
                      <div className="d-none d-md-block">
                        <div className="d-flex fw-bold border-bottom p-2 bg-light">
                          <div style={{ width: '5%' }}>#</div>
                          <div style={{ width: '30%' }}>Name</div>
                          <div style={{ width: '8%' }}>Preview</div>
                          <div style={{ width: '10%' }}>Locked</div>
                          <div style={{ width: '12%' }}>Release</div>
                          <div style={{ width: '10%' }}>Duration</div>
                          <div style={{ width: '10%' }}>Video</div>
                          <div style={{ width: '15%' }} className="text-center">Actions</div>
                        </div>

                        {lectures.map((lec, idx) => (
                          <DraggableRow key={lec.id} index={idx} lecture={lec} moveLecture={moveLecture}>
                          <div
                          className={`lecture-row d-flex border align-items-center p-3 rounded shadow-sm mb-2 ${idx % 2 === 0 ? 'bg-light' : 'bg-white'}`}
                          style={{ width: '100%' }}
                        >
                          <div style={{ width: '5%' }}>{idx + 1}</div>
                          <div style={{ width: '30%' }}>{lec.name}</div>
                          <div style={{ width: '8%' }}>{lec.is_preview ? '✅' : '❌'}</div>
                          <div style={{ width: '10%' }}>
                            <span className={`badge ${lec.is_locked ? 'bg-danger' : 'bg-success'}`}>
                              {lec.is_locked ? 'Locked' : 'Unlocked'}
                            </span>
                          </div>
                          <div style={{ width: '12%' }}>
                            {lec.release_date ? new Date(lec.release_date).toLocaleDateString() : '—'}
                          </div>
                          <div style={{ width: '10%' }}>{fmtDuration(lec.duration)}</div>
                          <div style={{ width: '10%' }}>
                            {lec.video ? (
                              <button
                                className="btn btn-sm btn-link text-primary p-0"
                                onClick={() => showVideo(lec.video, lec)}
                              >
                                View
                              </button>
                            ) : '—'}
                          </div>
                          <div style={{ width: '15%' }} className="d-flex justify-content-center gap-2">
                            <CTooltip content="Edit" placement="top">
                              <button className="icon-btn edit-btn" onClick={() => openModal('update', lec)}>
                                <CIcon icon={cilPen} />
                              </button>
                            </CTooltip>
                            <CTooltip content="Delete" placement="top">
                              <button className="icon-btn delete-btn" onClick={() => openModal('delete', lec)}>
                                <CIcon icon={cilTrash} />
                              </button>
                            </CTooltip>
                          </div>
                        </div>

                        </DraggableRow>

                        ))}
                      </div>
                     {isOrderChanged && (
                      <div className="text-end mt-3">
                        <CButton color="success" size="sm" onClick={saveOrder}>
                          Save Order
                        </CButton>
                      </div>
                    )}
                    </>
                  )}
                </CCardBody>
              </CCollapse>
            </CCard>

            <CreateLecture visible={modalOpen} sectionId={sectionId} onClose={() => setModalOpen(false)} onCreated={fetchAll} />

            <CModal visible={!!modalAction} onClose={closeModal}>
              <CModalHeader onClose={closeModal}>
                {modalAction === 'delete' ? 'Delete Lecture' : 'Update Lecture'}
              </CModalHeader>
              <CModalBody>
                {modalAction === 'delete' && selectedLecture && (
                  <LectureDeleteConfirm lecture={selectedLecture} onDeleted={fetchAll} onClose={closeModal} />
                )}
                {modalAction === 'update' && selectedLecture && (
                  <LectureUpdate lecture={selectedLecture} onUpdated={fetchAll} onClose={closeModal} />
                )}
              </CModalBody>
            </CModal>
           <CModal
              visible={videoModalOpen}
              onClose={() => setVideoModalOpen(false)}
              backdrop="static"
              className="custom-video-modal"
            >
              <CModalHeader
                onClose={() => setVideoModalOpen(false)}
                className=""
              >
                {selectedLecture?.name || 'Lecture Title'}
              </CModalHeader>

              <CModalBody
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ paddingBottom: '2rem' }}
              >
                {/* VIDEO PLAYER */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '960px',
                    height: '450px',
                    background: '#000',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.6)',
                  }}
                >
                  {currentVideoUrl.endsWith('.mp4') ? (
                    <video controls style={{ width: '100%', height: '100%' }}>
                      <source src={currentVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={currentVideoUrl}
                      title="Lecture Video"
                      allowFullScreen
                      frameBorder="0"
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </div>

                {/* TITLE BELOW */}
                <div
                  className="text-start mt-4 w-100 px-3"
                  style={{ maxWidth: '900px', color: '#e5e5e5' }}
                >
                  <h2 className="fw-bold mb-3" style={{ fontSize: '1.75rem' }}>
                    {selectedLecture?.name || 'Lecture Title'}
                  </h2>
                  <p className="mb-0">
                    <strong></strong> {section?.name || '—'} &nbsp;|&nbsp;
                    <strong></strong> {section?.track_name || '—'} &nbsp;|&nbsp;
                    <strong></strong> {section?.course_name || '—'}
                  </p>
                </div>
              </CModalBody>
            </CModal>

              </>
        ) : (
          <div className="py-5 text-center">Section not found.</div>
        )}
      </CContainer>
    </DndProvider>
  );
};

export default SectionDetail;
