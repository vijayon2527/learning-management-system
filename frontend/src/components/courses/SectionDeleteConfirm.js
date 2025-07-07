// src/components/sections/SectionDeleteConfirm.js
import React, { useState } from 'react';
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
} from '@coreui/react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

/**
 * Props:
 *  - section : section object to delete
 *  - visible : boolean
 *  - onClose : cancel/close
 *  - onDeleted: callback to refresh list
 */
const SectionDeleteConfirm = ({ section, visible, onClose, onDeleted }) => {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await axiosInstance.delete(`/api/courses/sections/${section.id}/`);
      toast.success('Section deleted');
      onDeleted();
      onClose();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader onClose={onClose}>Delete Section</CModalHeader>
      <CModalBody>
        Are you sure you want to delete <strong>{section.title}</strong>?
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="danger" onClick={handleDelete} disabled={busy}>
          {busy && <CSpinner size="sm" className="me-2" />}
          Delete
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default SectionDeleteConfirm;
