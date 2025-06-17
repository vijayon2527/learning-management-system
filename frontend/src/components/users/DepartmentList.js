import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import DepartmentCreate from "./DepartmentCreate";
import DepartmentUpdate from "./DepartmentUpdate";
import DepartmentDetail from "./DepartmentDetail";
import DepartmentDeleteConfirm from "./DepartmentDeleteConfirm";
import AGPModal from "../common/AGPModal";
import {
  CContainer,
  CTooltip,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
} from "@coreui/react";
import { CIcon } from "@coreui/icons-react";
import { cilUserPlus, cilPen, cilTrash } from "@coreui/icons";
import PermissionWrapper from "../common/RoleWrapper";
import Permissions from "../common/Roles";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState({});

  // Fetch the list of departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("api/users/departments/");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Handle department creation
  const handleDepartmentCreated = (newDepartment) => {
    setDepartments((prevDepartments) => [newDepartment, ...prevDepartments]);
  };

  // Handle department update
  const handleUpdateDepartment = (updatedDepartment) => {
    setDepartments((prevDepartments) =>
      prevDepartments.map((department) =>
        department.id === updatedDepartment.id ? updatedDepartment : department
      )
    );
  };

  // Remove department from the list
  const removeDepartmentFromList = (departmentId) => {
    setDepartments((prevDepartments) =>
      prevDepartments.filter((dept) => dept.id !== departmentId)
    );
  };

  // Handle action button click
  const handleAction = (action, department = null) => {
    setModalAction(action);
    setCurrentDepartment(department);
  };

  // Close the modal
  const closeModal = () => {
    setModalAction(null);
    setCurrentDepartment(null);
  };

  // Truncate description
  const truncateDescription = (description, length = 50, field = null) => {
    if (!description) return "No description available";
    if (expandedDescription[field]) return description;
    return description.length > length ? (
      <span>
        {description.substring(0, length)}...
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setExpandedDescription((prev) => ({
              ...prev,
              [field]: true,
            }));
          }}
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          more
        </a>
      </span>
    ) : (
      description
    );
  };

  const toggleDescription = (field) => {
    setExpandedDescription((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <CContainer fluid style={{ padding: "1rem", backgroundColor: "#f8f9fa" }}>
      <PermissionWrapper requiredPermission={Permissions.ADD_DEPARTMENT}>
        <CTooltip content="Add Department" placement="top">
          <CButton
            color="primary"
            onClick={() => handleAction("create")}
            className="mb-3 float-end"
          >
            <CIcon icon={cilUserPlus} />
          </CButton>
        </CTooltip>
      </PermissionWrapper>
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <CSpinner color="primary" />
        </div>
      ) : (
        <CTable borderColor="dark">
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
                <PermissionWrapper requiredPermission={Permissions.VIEW_DEPARTMENT}>
                  <CTableDataCell>
                    <a
                      href="#"
                      onClick={() => handleAction("detail", dept)}  // Open detail on name click
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {dept.name}
                    </a>
                  </CTableDataCell>
                </PermissionWrapper>
                <CTableDataCell>
                  {truncateDescription(dept.description, 50, `description-${dept.id}`)}
                  {expandedDescription[`description-${dept.id}`] && (
                    <button
                      onClick={() => toggleDescription(`description-${dept.id}`)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "blue",
                        cursor: "pointer",
                        paddingLeft: "5px",
                      }}
                    >
                      Read Less
                    </button>
                  )}
                </CTableDataCell>
                <CTableDataCell>
                <PermissionWrapper requiredPermission={Permissions.CHANGE_DEPARTMENT}>
                  <CIcon
                    icon={cilPen}
                    onClick={() => handleAction("update", dept)}
                    style={{ fontSize: "20px", color: "blue", cursor: "pointer", marginRight: "10px" }}
                    title="Update"
                  />
                </PermissionWrapper>
                <PermissionWrapper requiredPermission={Permissions.DELETE_DEPARTMENT}>
                  <CIcon
                    icon={cilTrash}
                    onClick={() => handleAction("delete", dept)}
                    style={{ fontSize: "20px", color: "red", cursor: "pointer" }}
                    title="Delete"
                  />
                  </PermissionWrapper>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      <AGPModal
        isOpen={modalAction !== null}
        onClose={closeModal}
        title={
          modalAction === "create"
            ? "Create Department"
            : modalAction === "update"
            ? "Update Department"
            : modalAction === "detail"
            ? "Department Detail"
            : modalAction === "delete"
            ? "Delete Department"
            : ""
        }
      >
        {modalAction === "create" && (
          <DepartmentCreate
            action="create"
            onDepartmentCreated={handleDepartmentCreated}
            onClose={closeModal}
          />
        )}

        {modalAction === "update" && (
          <DepartmentUpdate
            departmentId={currentDepartment?.id}
            onClose={closeModal}
            onDepartmentUpdated={handleUpdateDepartment}
          />
        )}

        {modalAction === "detail" && (
          <DepartmentDetail departmentId={currentDepartment?.id} />
        )}

        {modalAction === "delete" && (
          <DepartmentDeleteConfirm
            department={currentDepartment}
            onClose={closeModal}
            removeDepartment={removeDepartmentFromList}
          />
        )}
      </AGPModal>
    </CContainer>
  );
};

export default DepartmentList;
