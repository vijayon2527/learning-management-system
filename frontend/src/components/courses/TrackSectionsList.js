import React, { useEffect, useMemo, useState } from 'react';
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
  CFormInput,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash, cilLibraryAdd, cilArrowLeft } from '@coreui/icons';

import axiosInstance from '../../utils/axiosInstance';
import CreateTrackSection from './CreateTrackSection';
import SectionUpdate from './SectionUpdate';
import SectionDeleteConfirm from './SectionDeleteConfirm';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ───────────────────── helpers ───────────────────── */
const plainText = (html = '') => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};
const truncate = (txt, n = 150) =>
  txt.length > n ? `${txt.slice(0, n)}…` : txt;

/* ───────────────────── component ─────────────────── */
export default function SectionList() {
  const { trackId,slug } = useParams();
  const navigate = useNavigate();

  /* state ----------------------------------------------------------- */
  const [sections, setSections] = useState([]);
  const [trackName, setTrackName] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  /* CRUD modal state */
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchData = async () => {
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
    fetchData();
  }, [trackId]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return sections.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        plainText(s.description).toLowerCase().includes(q)
    );
  }, [sections, filter]);

  const toggleStatus = async (section) => {
    setUpdatingStatusId(section.id);
    try {
      await axiosInstance.patch(`/api/courses/sections/${section.id}/`, {
        is_active: !section.is_active,
      });
      toast.success(
        `Section ${section.is_active ? 'deactivated' : 'activated'} successfully`
      );
      fetchData();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
      setConfirmStatus(null);
    }
  };

  /* ---------------------------------------------------------------- */

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-end p-2 border-bottom bg-white">
        <CTooltip content="Go back">
          <CButton
            color="light"
            className="text-dark border border-secondary"
            onClick={() => navigate(`/dashboard/course-details/${slug}`)
}
          >
            <CIcon icon={cilArrowLeft} className="me-2" />
            Back
          </CButton>
        </CTooltip>
      </div>

      {/* main content ------------------------------------------------- */}
      <CContainer fluid className="p-3 bg-light">
        {/* heading + toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className=" m-0 d-flex align-items-center gap-2">
            <span className="">Sections List</span>
            <span className="">— {trackName}</span>
          </h2>


          <div className="d-flex align-items-center gap-3">
            <CFormInput
              size="sm"
              placeholder="Start typing to search.."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            <CTooltip content="Add Section">
              <CButton size="sm" color="primary" onClick={() => setShowCreate(true)}>
                <CIcon icon={cilLibraryAdd} />
              </CButton>
            </CTooltip>
          </div>
        </div>

        {/* table */}
        {loading ? (
          <div className="d-flex justify-content-center p-4">
            <CSpinner />
          </div>
        ) : (
          <CTable striped hover responsive className="shadow-sm bg-white rounded">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.map((s, idx) => (
                <CTableRow key={s.id} verticalAlign="middle">
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell>
                    <span
                      className="text-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(
                        `/dashboard/course-details/${slug}/track-section-list/${trackId}/section-lectures/${s.id}`
                      )}
                    >
                      {s.name}
                    </span>
                  </CTableDataCell>

                  <CTableDataCell>{truncate(plainText(s.description))}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    {updatingStatusId === s.id ? (
                      <CSpinner size="sm" />
                    ) : (
                      <CTooltip content={s.is_active ? 'Active' : 'Inactive'}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={s.is_active}
                            onChange={() => setConfirmStatus(s)}
                          />
                          <span className="slider round" />
                        </label>
                      </CTooltip>
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <CTooltip content="Edit">
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => setEditId(s.id)}
                        >
                          <CIcon icon={cilPen} />
                        </button>
                      </CTooltip>
                      <CTooltip content="Delete">
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => setDeleteId(s.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </button>
                      </CTooltip>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}

        {/* create modal */}
        <CModal visible={showCreate} onClose={() => setShowCreate(false)} size="lg" scrollable>
          <CModalHeader onClose={() => setShowCreate(false)}>Create Section</CModalHeader>
          <CModalBody>
            <CreateTrackSection
              onClose={() => setShowCreate(false)}
              onSectionAdded={fetchData}
            />
          </CModalBody>
        </CModal>

        {/* update modal */}
        <CModal visible={!!editId} onClose={() => setEditId(null)} size="lg" scrollable>
          <CModalHeader onClose={() => setEditId(null)}>Update Section</CModalHeader>
          <CModalBody>
            {editId && (
              <SectionUpdate
                sectionId={editId}
                onClose={() => setEditId(null)}
                onUpdated={fetchData}
              />
            )}
          </CModalBody>
        </CModal>

        {/* delete modal */}
        {deleteId && (
          <SectionDeleteConfirm
            section={sections.find((s) => s.id === deleteId)}
            visible
            onClose={() => setDeleteId(null)}
            onDeleted={fetchData}
          />
        )}

        {/* status confirm modal */}
        <CModal visible={!!confirmStatus} onClose={() => setConfirmStatus(null)}>
          <CModalHeader onClose={() => setConfirmStatus(null)}>
            Confirm Status Change
          </CModalHeader>
          <CModalBody>
            Are you sure you want to{' '}
            <strong>{confirmStatus?.is_active ? 'deactivate' : 'activate'}</strong>{' '}
            section <strong>{confirmStatus?.name}</strong>?
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={() => setConfirmStatus(null)}>
              Cancel
            </CButton>
            <CButton
              color={confirmStatus?.is_active ? 'danger' : 'success'}
              onClick={() => toggleStatus(confirmStatus)}
            >
              Yes, {confirmStatus?.is_active ? 'Deactivate' : 'Activate'}
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </>
  );
}
