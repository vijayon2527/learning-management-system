import React from 'react';
import { CButton } from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance'; // Adjust the import path as necessary
import { toast } from 'react-toastify';

const RoleDeleteConfirm = ({ role, onClose, removeRole }) => {
  // Function to show notifications
  const notify = (msg) => toast(msg);

  // Handle delete action
  const handleDelete = async () => {
    try {
      // Send delete request to API
      await axiosInstance.delete(`api/users/role-delete/${role.id}/`);
      notify("Role deleted successfully!");

      // Call the function passed from parent to update the role list
      removeRole(role.id); // Remove the role from the list

      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error deleting role:", err);
      notify("Failed to delete role.");
    } finally {
      console.log('Delete action completed');
    }
  };

  return (
    <div>
      {/* Confirmation message */}
      <p>
        Are you sure you want to delete the role <b>"{role.name}"</b>?
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

export default RoleDeleteConfirm;
