import React from 'react';
import { CButton } from '@coreui/react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axiosInstance';

const CourseCategoryDeleteConfirm = ({ courseCategory, onClose, removeCourseCategory }) => {
  // Function to show notifications
  const notify = (msg) => toast(msg);

  // Handle delete action
  const handleDelete = async () => {
    try {
      // Send delete request to API
      await axiosInstance.delete(`api/material/materials/${courseCategory.id}/`);
      notify("Course Category deleted successfully!");

      // Call the function passed from parent to update the material list
      removeCourseCategory(courseCategory.id); // Remove the material from the list

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error deleting material:", err);
      notify("Failed to delete course cagegory.");
    } finally {
      console.log('Delete action completed');
    }
  };

  return (
    <div>
      {/* Confirmation message */}
      <p>
        Are you sure you want to delete the material <b>"{courseCategory.name}"</b>?
      </p>
      
      {/* Action buttons */}
      <div className='text-end'>
        <CButton color="danger" onClick={handleDelete} className="me-3">
          Yes, Delete
        </CButton>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
      </div>
    </div>
  );
};

export default CourseCategoryDeleteConfirm;
