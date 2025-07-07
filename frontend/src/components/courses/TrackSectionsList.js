import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CTooltip,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPen, cilLibraryAdd, cilArrowLeft } from '@coreui/icons';
import axiosInstance from '../../utils/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';

import CreateTrackSection from './CreateTrackSection';
import SectionUpdate from './SectionUpdate';
import SectionDeleteConfirm from './SectionDeleteConfirm';

import 'react-toastify/dist/ReactToastify.css';

/* ------------------------------------------------------------------ */
/* helpers */

const stripHtml = (html, len = 100) => {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  const text = div.textContent || div.innerText || '';
  return text.length > len ? `${text.slice(0, len)}…` : text;
};

/* ------------------------------------------------------------------ */

const SectionList = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();

  /* state ----------------------------------------------------------- */
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackName, setTrackName] = useState('');

  /* CRUD modal state */
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  /* status‑toggle modal state */
  const [confirmStatusSection, setConfirmStatusSection] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  /* fetch ----------------------------------------------------------- */
  const fetchSections = async () => {
    setLoading(true);
    try {
      const [secRes, trackRes] = await Promise.all([
        axiosInstance.get(`/api/courses/sections/?track=${trackId}`),
        axiosInstance.get(`/api/courses/tracks/${trackId}/`),
      ]);
      setSections(secRes.data);
      setTrackName(trackRes.data.name);
    } catch {
      toast.error('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  /* status toggle --------------------------------------------------- */
  const requestStatusChange = (section) => setConfirmStatusSection(section);

  const handleToggleStatus = async (section) => {
    setUpdatingStatusId(section.id);
    try {
      await axiosInstance.patch(`/api/courses/sections/${section.id}/`, {
        is_active: !section.is_active,
      });
      toast.success(
        `Section ${section.is_active ? 'deactivated' : 'activated'} successfully`
      );
      fetchSections();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
      setConfirmStatusSection(null);
    }
  };

  /* ---------------------------------------------------------------- */

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Back button -------------------------------------------------- */}
      <div className="d-flex justify-content-end p-2 border-bottom">
        <CTooltip content="Go back">
          <CButton
            color="light"
            className="text-dark border border-secondary"
            onClick={() => navigate(-1)}
            style={{
              fontWeight: 600,
              borderRadius: '2rem',
              padding: '0.45rem 1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CIcon icon={cilArrowLeft} className="me-2" />
            Back
          </CButton>
        </CTooltip>
      </div>

      {/* main content ------------------------------------------------- */}
      <CContainer fluid className="p-3 bg-light">
        {/* header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">
            Sections: <strong>{trackName}</strong>
          </h3>
          <CButton size="sm" color="primary" onClick={() => setShowCreate(true)}>
            <CIcon icon={cilLibraryAdd} className="me-2" />
            Add Section
          </CButton>
        </div>

        {/* table */}
        {loading ? (
          <div className="text-center py-5">
            <CSpinner />
          </div>
        ) : (
          <CTable striped hover responsive className="shadow-sm bg-white rounded">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell>Overview</CTableHeaderCell>
                <CTableHeaderCell>Media</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {sections.map((s, idx) => (
                <CTableRow key={s.id} verticalAlign="middle">
                  {/* index */}
                  <CTableDataCell>{idx + 1}</CTableDataCell>

                  {/* clickable title */}
                  <CTableDataCell>
                    <span
                      style={{ color: '#0d6efd', cursor: 'pointer' }}
                      onClick={() => navigate(`/dashboard/section/${s.id}`)}
                    >
                      {s.title}
                    </span>
                  </CTableDataCell>

                  {/* overview */}
                  <CTableDataCell>{stripHtml(s.overview)}</CTableDataCell>

                  {/* media type */}
                  <CTableDataCell>{s.media_type || 'text'}</CTableDataCell>

                  {/* status toggle */}
                  <CTableDataCell className="text-center">
                    {updatingStatusId === s.id ? (
                      <CSpinner size="sm" />
                    ) : (
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={s.is_active}
                          onChange={() => requestStatusChange(s)}
                        />
                        <span className="slider round" />
                      </label>
                    )}
                  </CTableDataCell>

                  {/* action buttons */}
                  <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <CTooltip content="Edit">
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => setEditId(s.id)}
                        >
                          <CIcon
                            icon={cilPen}
                            style={{ color: '#000', height: 18, width: 18 }}
                          />
                        </button>
                      </CTooltip>
                      <CTooltip content="Delete">
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => setDeleteId(s.id)}
                        >
                          <CIcon
                            icon={cilTrash}
                            style={{ color: '#000', height: 18, width: 18 }}
                          />
                        </button>
                      </CTooltip>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}

      {/* ---------- Create Section Modal ---------- */}
          <CModal
            visible={showCreate}
            onClose={() => setShowCreate(false)}
            size="lg"
            scrollable
          >
            <CModalHeader onClose={() => setShowCreate(false)}>
              Create Section
            </CModalHeader>
            <CModalBody>
              <CreateTrackSection
                onClose={() => setShowCreate(false)}
                onSectionAdded={fetchSections}
              />
            </CModalBody>
          </CModal>

          {/* ---------- Update Section Modal ---------- */}
          <CModal
            visible={!!editId}
            onClose={() => setEditId(null)}
            size="lg"
            scrollable
          >
            <CModalHeader onClose={() => setEditId(null)}>
              Update Section
            </CModalHeader>
            <CModalBody>
              {editId && (
                <SectionUpdate
                  sectionId={editId}
                  onClose={() => setEditId(null)}
                  onUpdated={fetchSections}
                />
              )}
            </CModalBody>
          </CModal>

          {/* ---------- Delete Section Modal ---------- */}
          {deleteId && (
            <SectionDeleteConfirm
              section={sections.find((s) => s.id === deleteId)}
              visible
              onClose={() => setDeleteId(null)}
              onDeleted={fetchSections}
            />
          )}


        {/* Status‑confirm modal */}
        <CModal
          visible={!!confirmStatusSection}
          onClose={() => setConfirmStatusSection(null)}
        >
          <CModalHeader onClose={() => setConfirmStatusSection(null)}>
            Confirm Status Change
          </CModalHeader>
          <CModalBody>
            Are you sure you want to{' '}
            <strong>
              {confirmStatusSection?.is_active ? 'deactivate' : 'activate'}
            </strong>{' '}
            the section <strong>{confirmStatusSection?.title}</strong>?
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => setConfirmStatusSection(null)}
            >
              Cancel
            </CButton>
            <CButton
              color={confirmStatusSection?.is_active ? 'danger' : 'success'}
              onClick={() => handleToggleStatus(confirmStatusSection)}
            >
              Yes, {confirmStatusSection?.is_active ? 'Deactivate' : 'Activate'}
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </>
  );
};

export default SectionList;
