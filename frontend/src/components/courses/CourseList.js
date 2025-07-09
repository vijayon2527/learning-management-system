import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

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
import { cilPen, cilTrash, cilLibrary } from '@coreui/icons';

import CourseCreate from './CreateCourse';
import CourseUpdate from './CourseUpdate';
import CourseDeleteConfirm from './CourseDeleteConfirm';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper: strip HTML and truncate
const stripAndTruncate = (html, length = 150) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  return text.length > length ? `${text.slice(0, length)}…` : text;
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');

  const [modalAction, setModalAction] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [confirmStatusCourse, setConfirmStatusCourse] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/api/courses/courses/'),
          axiosInstance.get('/api/courses/categories/'),
        ]);
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (c) =>
          c.name.toLowerCase().includes(filterText.toLowerCase()) ||
          (c.category_name &&
            c.category_name.toLowerCase().includes(filterText.toLowerCase()))
      ),
    [courses, filterText]
  );

  const handleCreated = (newCourse) => setCourses((p) => [newCourse, ...p]);
  const handleUpdated = (updated) =>
    setCourses((p) => p.map((c) => (c.id === updated.id ? updated : c)));
  const handleDeleted = (id) =>
    setCourses((p) => p.filter((c) => c.id !== id));

  const requestStatusChange = (course) => setConfirmStatusCourse(course);

  const handleToggleStatus = async (course) => {
    setUpdatingStatusId(course.id);
    try {
      const updated = { ...course, is_active: !course.is_active };
      await axiosInstance.patch(`api/courses/courses/${course.slug}/`, {
        is_active: updated.is_active,
      });
      handleUpdated(updated);
      toast.success(
        `Course ${updated.is_active ? 'activated' : 'deactivated'} successfully!`
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
      setConfirmStatusCourse(null);
    }
  };

  const openModal = (action, course = null) => {
    setModalAction(action);
    setSelectedCourse(course);
  };
  const closeModal = () => {
    setModalAction(null);
    setSelectedCourse(null);
  };

  return (
    <CContainer fluid className="p-3 bg-light">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-o">Course List</h2>
        <div className="d-flex align-items-center gap-3">
          <CFormInput
            size="sm"
            placeholder="Search by name or category"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
          <CTooltip content="Add New Course">
            <CButton color="primary" onClick={() => openModal('create')}>
              <CIcon icon={cilLibrary} className="me-2" />
            </CButton>
          </CTooltip>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-4">
          <CSpinner />
        </div>
      ) : (
        <CTable striped hover responsive className="shadow-sm bg-white rounded">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Logo</CTableHeaderCell>
              <CTableHeaderCell>Summary</CTableHeaderCell>
              <CTableHeaderCell>Category</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredCourses.map((c, idx) => (
              <CTableRow key={c.id} verticalAlign="middle">
                <CTableDataCell>{idx + 1}</CTableDataCell>

                {/* clickable name */}
                <CTableDataCell>
                  <span
                    onClick={() => navigate(`/dashboard/course-details/${c.slug}`)}
                    style={{
                      color: '#0d6efd',
                      cursor: 'pointer',
                    }}
                  >
                    {c.name}
                  </span>
                </CTableDataCell>
                <CTableDataCell>
                  {c.logo ? (
                    <img
                      src={c.logo}
                      alt={c.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#aaa',
                        border: '1px solid #ddd',
                      }}
                    >
                      N/A
                    </div>
                  )}
                </CTableDataCell>
                        
                <CTableDataCell>{stripAndTruncate(c.summary)}</CTableDataCell>

                <CTableDataCell>{c.category_name || '–'}</CTableDataCell>

                <CTableDataCell className="text-center">
                  {updatingStatusId === c.slug ? (
                    <CSpinner size="sm" />
                  ) : (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={c.is_active}
                        onChange={() => requestStatusChange(c)}
                      />
                      <span className="slider round" />
                    </label>
                  )}
                </CTableDataCell>

                <CTableDataCell className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <CTooltip content="Edit">
                      <button
                        className="icon-btn edit-btn"
                        onClick={() => openModal('update', c)}
                      >
                        <CIcon icon={cilPen} style={{ height: 18, width: 18 }} />
                      </button>
                    </CTooltip>
                    <CTooltip content="Delete">
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => openModal('delete', c)}
                      >
                        <CIcon icon={cilTrash} style={{ height: 18, width: 18 }} />
                      </button>
                    </CTooltip>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      {/* CRUD Modals */}
      <CModal
        visible={!!modalAction}
        onClose={closeModal}
        size={['create', 'update'].includes(modalAction) ? 'lg' : ''}
      >
        <CModalHeader onClose={closeModal}>
          {{
            create: 'Create Course',
            update: 'Update Course',
            delete: 'Delete Course',
          }[modalAction]}
        </CModalHeader>
        <CModalBody>
          {modalAction === 'create' && (
            <CourseCreate
              categories={categories}
              onCreated={handleCreated}
              onClose={closeModal}
            />
          )}
          {modalAction === 'update' && (
            <CourseUpdate
              course={selectedCourse}
              categories={categories}
              onUpdated={handleUpdated}
              onClose={closeModal}
            />
          )}
          {modalAction === 'delete' && (
            <CourseDeleteConfirm
              course={selectedCourse}
              onDeleted={handleDeleted}
              onClose={closeModal}
            />
          )}
        </CModalBody>
      </CModal>

      <CModal
        visible={!!confirmStatusCourse}
        onClose={() => setConfirmStatusCourse(null)}
      >
        <CModalHeader onClose={() => setConfirmStatusCourse(null)}>
          Confirm Status Change
        </CModalHeader>
        <CModalBody>
          Are you sure you want to{' '}
          <strong>
            {confirmStatusCourse?.is_active ? 'deactivate' : 'activate'}
          </strong>{' '}
          the course <strong>{confirmStatusCourse?.name}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => setConfirmStatusCourse(null)}
          >
            Cancel
          </CButton>
          <CButton
            color={confirmStatusCourse?.is_active ? 'danger' : 'success'}
            onClick={() => handleToggleStatus(confirmStatusCourse)}
          >
            Yes, {confirmStatusCourse?.is_active ? 'Deactivate' : 'Activate'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default CourseList;
