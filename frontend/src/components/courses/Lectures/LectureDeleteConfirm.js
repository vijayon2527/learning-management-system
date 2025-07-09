import React, { useState } from "react";
import { CButton, CAlert } from "@coreui/react";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance";

const LectureDeleteConfirm = ({ lecture, onDeleted, onClose }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await axiosInstance.delete(`/api/courses/lectures/${lecture.id}/`);
      toast.success("Lecture deleted successfully!");
      onDeleted();  // or onDeleted(lecture.id) based on your usage
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not delete this lecture.");
      toast.error("Failed to delete lecture.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {error && <CAlert color="danger">{error}</CAlert>}
      <p>
        Are you sure you want to delete <strong>{lecture.name}</strong>?
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

export default LectureDeleteConfirm;
