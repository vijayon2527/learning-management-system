import React from 'react';
import { CButton } from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance'; // Adjust the import path as necessary
import { toast } from 'react-toastify';

const DepartmentDeleteConfirm = ({ department, onClose, removeDepartment }) => {
  // Function to show notifications
  const notify = (msg) => toast(msg);

  // Handle delete action
  const handleDelete = async () => {
    try {
      // Send delete request to API
      await axiosInstance.delete(`api/users/department-delete/${department.id}/`);
      notify("Department deleted successfully!");

      // Call the function passed from parent to update the department list
      removeDepartment(department.id); // Remove the department from the list

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error deleting department:", err);
      notify("Failed to delete department.");
    } finally {
      console.log('Delete action completed');
    }
  };

  return (
    <div>
      {/* Confirmation message */}
      <p>
        Are you sure you want to delete the department <b>"{department.name}"</b>?
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

export default DepartmentDeleteConfirm;
