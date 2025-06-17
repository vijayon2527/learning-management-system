import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify"; 
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormText,
} from "@coreui/react";

const UserDeleteConfirm = ({ user, onClose, removeUser }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // API call to delete the user
      await axiosInstance.delete(`api/users/delete/${user.id}/`);
      
      // Remove the user from the list after successful deletion
      removeUser(user.id);
      onClose(); // Close the modal after deletion
      toast.success(`User ${user.first_name} ${user.last_name} deleted successfully!`); // Success toast
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user. Please try again."); // Error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <CModal visible={true} onClose={onClose}>
      <CModalHeader>Delete User</CModalHeader>
      <CModalBody>
        <CFormText>
          Are you sure you want to delete the user <strong>{user.first_name} {user.last_name}</strong>?
        </CFormText>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </CButton>
        <CButton color="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default UserDeleteConfirm;
