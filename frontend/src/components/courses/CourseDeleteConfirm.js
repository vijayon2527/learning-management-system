import React, { useState } from "react";
import { CButton, CAlert } from "@coreui/react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";

const notifySuccess = (msg) => toast(msg, { type: "success" });
const notifyError = (msg) => toast(msg, { type: "error" });

const CourseDeleteConfirm = ({ course, onDeleted, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await axiosInstance.delete(`/api/courses/courses/${course.id}/`);
      notifySuccess("Course deleted successfully!");
      onDeleted(course.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not delete this course.");
      notifyError("Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {error && <CAlert color="danger">{error}</CAlert>}
      <p>
        Are you sure you want to delete <strong>{course.name}</strong>?
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

export default CourseDeleteConfirm;
