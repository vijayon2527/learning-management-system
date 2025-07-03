import React from "react";
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormText,
} from "@coreui/react";

const ConfirmDialog = ({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmType = "delete",
  isActive = false,
  loading = false,
}) => {
  const getButtonLabel = () => {
    if (confirmType === "status") return isActive ? "Deactivate" : "Activate";
    return "Delete";
  };

  const getButtonColor = () => {
    if (confirmType === "status") return isActive ? "danger" : "success";
    return "danger";
  };

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>{title}</CModalHeader>
      <CModalBody>
        <CFormText className="text-medium-emphasis" dangerouslySetInnerHTML={{ __html: message }} />
     </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </CButton>
        <CButton color={getButtonColor()} onClick={onConfirm} disabled={loading}>
          {loading ? "Processing..." : getButtonLabel()}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ConfirmDialog;