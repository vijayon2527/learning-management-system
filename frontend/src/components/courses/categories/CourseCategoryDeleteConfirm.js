import React, { useState } from "react";
import { CButton, CAlert } from "@coreui/react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

const notifySuccess = (message) => toast(message, { type: "success" });
const notifyError = (message) => toast(message, { type: "error" });

const CategoryDeleteConfirm = ({ category, onDeleted, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await axiosInstance.delete(`/api/courses/categories/${category.id}/`);
      notifySuccess("Category deleted successfully!");
      onDeleted(category.id);
      onClose();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Could not delete. This category may have related data.");
      notifyError("Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {error && <CAlert color="danger">{error}</CAlert>}
      <p>
        Are you sure you want to delete <strong>{category.name}</strong>?
      </p>
      <div className="d-flex justify-content-end">
        <CButton color="secondary" onClick={onClose} className="me-2">
          Cancel
        </CButton>
        <CButton color="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </CButton>
      </div>
    </div>
  );
};

export default CategoryDeleteConfirm;
