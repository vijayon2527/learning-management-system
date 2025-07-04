import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CTooltip,
  CButton
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/courses/');
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (courseId) => {
    try {
      const res = await axiosInstance.patch(`/api/courses/${courseId}/toggle_active/`);
      const updatedCourse = res.data;

      // Update local state
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === updatedCourse.id
            ? { ...course, is_active: updatedCourse.is_active }
            : course
        )
      );

      toast.success(`Course ${updatedCourse.is_active ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Failed to toggle course status:', error);
      toast.error('Failed to update course status');
    }
  };

  const handleViewClick = (id, name) => {
    navigate(`/dashboard/feature-comparison/${id}/${encodeURIComponent(name)}`);
  };
return (
  <CContainer fluid className="p-2 bg-light">
    <ToastContainer position="top-right" autoClose={3000} />

    {/* Heading with Add Course button */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0">Course List</h2>
      
      <CTooltip content="Create new course" placement="left">
        <CButton
          color="primary"
          onClick={() => (true)}  // Replace with actual handler
          style={{ fontWeight: 600 }}
        >
          + Add Course
        </CButton>
      </CTooltip>
    </div>


    {loading ? (
      <div className="d-flex justify-content-center p-4">
        <CSpinner color="primary" />
      </div>
    ) : (
      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Summary</CTableHeaderCell>
            <CTableHeaderCell>Category</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {courses.map((course, index) => (
            <CTableRow key={course.id}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>
                <a
                  href="#"
                  onClick={() => navigate(`/dashboard/course-details/${course.id}`)}
                  style={{ color: '#007bff', textDecoration: 'none' }}
                >
                  {course.name}
                </a>
              </CTableDataCell>
              <CTableDataCell>{course.summary}</CTableDataCell>
              <CTableDataCell>{course.category_name || 'N/A'}</CTableDataCell>
              <CTableDataCell>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={course.is_active}
                    onChange={() => handleToggleStatus(course.id, course.is_active)}
                  />
                  <span className="slider round"></span>
                </label>
              </CTableDataCell>
              <CTableDataCell>
                <CTooltip content="Edit Course">
                  <CIcon
                    icon={cilPen}
                    style={{ color: 'blue', cursor: 'pointer', marginRight: '10px' }}
                    onClick={() => alert('Edit functionality coming soon')}
                  />
                </CTooltip>
                <CTooltip content="Delete Course">
                  <CIcon
                    icon={cilTrash}
                    style={{ color: 'red', cursor: 'pointer' }}
                    onClick={() => alert('Delete confirmation coming soon')}
                  />
                </CTooltip>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    )}
  </CContainer>
);

};

export default CourseList;
