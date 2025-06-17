import React, { useEffect, useState } from "react";
import { CButton, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CContainer, CTooltip } from "@coreui/react";
import { cilUserPlus } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import AGPModal from "../../../components/common/AGPModal";
import FormInput from "../../../components/users/FormInput";
import useDepartments from "../../../components/users/useDepartments";
const DepartmentList = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", description: "" });
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDepartmentToDelete, setSelectedDepartmentToDelete] = useState(null);
  const [formValid, setFormValid] = useState(true);

  const {
    departments,
    loading,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartments();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const validateForm = (department) => {
    return department?.name.trim() && department?.description.trim();
  };

  const handleCreate = () => {
    if (!validateForm(newDepartment)) {
      setFormValid(false);
      return;
    }
    createDepartment(newDepartment);
    setNewDepartment({ name: "", description: "" });
    setShowModal(false);
  };

  const handleUpdate = () => {
    if (!validateForm(selectedDepartment)) {
      setFormValid(false);
      return;
    }
    updateDepartment(selectedDepartment);
    setShowModal(false);
  };

  const handleDelete = () => {
    deleteDepartment(selectedDepartmentToDelete.id);
    setShowDeleteModal(false);
  };

  return (
    <CContainer fluid>
      <CTooltip content="Add Department" placement="top">
        <CButton color="primary" onClick={() => setShowModal(true)} className="mb-3 float-end">
          <CIcon icon={cilUserPlus} />
        </CButton>
      </CTooltip>

      <CTable borderColor="dark" hover striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {departments.map((dept, index) => (
            <CTableRow key={dept.id}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{dept.name}</CTableDataCell>
              <CTableDataCell>{dept.description || "No description available"}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => setSelectedDepartment(dept) & setShowModal(true)}
                >
                  Update
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => setSelectedDepartmentToDelete(dept) & setShowDeleteModal(true)}
                >
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Create or Update Department AGPModal */}
      <AGPModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDepartment ? "Update Department" : "Create Department"}
        isLoading={loading}
        onAction={selectedDepartment ? handleUpdate : handleCreate}
        actionButtonText={selectedDepartment ? "Update" : "Create"}
      >
        <FormInput
          label="Name"
          value={selectedDepartment ? selectedDepartment.name : newDepartment.name}
          onChange={(e) =>
            selectedDepartment
              ? setSelectedDepartment({ ...selectedDepartment, name: e.target.value })
              : setNewDepartment({ ...newDepartment, name: e.target.value })
          }
          invalid={!formValid && !newDepartment.name.trim()}
          feedback="Name is required."
        />

        <FormInput
          label="Description"
          value={selectedDepartment ? selectedDepartment.description : newDepartment.description}
          onChange={(e) =>
            selectedDepartment
              ? setSelectedDepartment({ ...selectedDepartment, description: e.target.value })
              : setNewDepartment({ ...newDepartment, description: e.target.value })
          }
          invalid={!formValid && !newDepartment.description.trim()}
          feedback="Description is required."
        />
      </AGPModal>

      {/* Delete Confirmation AGPModal */}
      <AGPModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Department"
        isLoading={loading}
        onAction={handleDelete}
        actionButtonText="Delete"
      >
        <p>Are you sure you want to delete the department <strong>{selectedDepartmentToDelete?.name}</strong>?</p>
      </AGPModal>
    </CContainer>
  );
};

export default DepartmentList;