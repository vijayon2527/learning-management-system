import React, { useEffect, useState } from "react";
import RoleUpdate from "./RoleUpdate";
import RoleDetail from "./RoleDetail";
import RoleDeleteConfirm from "./RoleDeleteConfirm";
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
import { cilUserPlus,cilPen,cilTrash } from "@coreui/icons";
import axiosInstance from "../../utils/axiosInstance";
import CreateRole from "./CreateRole";
import PermissionWrapper from "../common/RoleWrapper";
import Permissions from "../common/Roles";

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedField, setExpandedField] = useState(null);

  useEffect(() => {
    const fetchRolesAndDepartments = async () => {
      setLoading(true);
      try {
        const rolesResponse = await axiosInstance.get("/api/users/roles-list/");
        const departmentsResponse = await axiosInstance.get("/api/users/departments/");
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
        setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);
      } catch (error) {
        console.error("Error fetching roles and departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRolesAndDepartments();
  }, []);

  const handleRoleCreated = (newRole) => {
    setRoles((prevRoles) => [newRole, ...prevRoles]);
  };

  const handleUpdateRole = (updatedRole) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === updatedRole.id ? updatedRole : role
      )
    );
  };

  const removeRoleFromList = (roleId) => {
    setRoles((prevRoles) =>
      prevRoles.filter((role) => role.id !== roleId)
    );
  };

  const handleAction = (action, role = null) => {
    setModalAction(action);
    setCurrentRole(role);
  };

  const closeModal = () => {
    setModalAction(null);
    setCurrentRole(null);
  };

  const truncateText = (text, length = 50, field = null) => {
    if (!text) return "";
    if (expandedField === field) return text;
    return text.length > length ? (
      <span>
        {text.substring(0, length)}...
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setExpandedField(field);
          }}
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          more
        </a>
      </span>
    ) : (
      text
    );
  };

  const toggleDescription = (field) => {
    setExpandedField((prev) => (prev === field ? null : field));
  };

  return (
    <CContainer fluid style={{ padding: "1rem", backgroundColor: "#f8f9fa" }}>
      <PermissionWrapper requiredPermission={Permissions.ADD_ROLE}>
        <CTooltip content="Add Role" placement="top">
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
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <CSpinner color="primary" />
        </div>
      ) : (
        <CTable borderColor="dark">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Description</CTableHeaderCell>
              <CTableHeaderCell>Department</CTableHeaderCell>
              <CTableHeaderCell>Permissions</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
         <CTableBody>
          {roles && roles.length > 0 ? (
            roles.map((role, index) => {
              if (!role) return null; // Ensure role is defined

              return (
                <CTableRow key={role.id || `role-${index}`}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>
                    <a
                      href="#"
                      onClick={() => handleAction("detail", role)}
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {role.name || "No Name"}
                    </a>
                  </CTableDataCell>
                  <CTableDataCell>
                    {truncateText(role.description || "No Description", 50, `description-${role.id}`)}
                    {expandedField === `description-${role.id}` && (
                      <button
                        onClick={() => toggleDescription(`description-${role.id}`)}
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
                  <CTableDataCell>{role.department?.name || "No Department"}</CTableDataCell>

                  {/* ✅ Added permissions display */}
                  <CTableDataCell>
                    {role.permissions && role.permissions.length > 0 ? (
                      <CTooltip
                        content={
                          <div style={{ maxWidth: "200px", textAlign: "left" }}>
                            <strong>Assigned Permissions:</strong>
                            <ul style={{ paddingLeft: "15px" }}>
                              {role.permissions.map((permission) => (
                                <li key={permission.id}>{permission.name}</li>
                              ))}
                            </ul>
                          </div>
                        }
                        placement="top"
                      >
                        <div
                          style={{
                            maxHeight: "100px",
                            maxWidth: "250px",
                            overflow: "auto",
                            whiteSpace: "nowrap",
                            scrollbarWidth: "thin",
                            msOverflowStyle: "none",
                            cursor: "pointer",
                          }}
                        >
                          {role.permissions.map((permission) => (
                            <span
                              key={permission.id}
                              style={{
                                display: "inline-block",
                                marginRight: "8px",
                                marginBottom: "4px",
                                border: "1px solid #ddd",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                backgroundColor: "#f1f1f1",
                              }}
                            >
                              {permission.name}
                            </span>
                          ))}
                        </div>
                      </CTooltip>
                    ) : (
                      "No Permissions"
                    )}
                  </CTableDataCell>

                  <CTableDataCell>
                    <PermissionWrapper requiredPermission={Permissions.CHANGE_ROLE}>
                      <CIcon
                        icon={cilPen}
                        onClick={() => handleAction("update", role)}
                        style={{ fontSize: "20px", color: "blue", cursor: "pointer", marginRight: "10px" }}
                        title="Update"
                      />
                    </PermissionWrapper>
                    <PermissionWrapper requiredPermission={Permissions.DELETE_ROLE}>
                      <CIcon
                        icon={cilTrash}
                        onClick={() => handleAction("delete", role)}
                        style={{ fontSize: "20px", color: "red", cursor: "pointer" }}
                        title="Delete"
                      />
                    </PermissionWrapper>
                  </CTableDataCell>
                </CTableRow>
              );
            })
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="6" style={{ textAlign: "center" }}>
                No roles available
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>



        </CTable>
      )}

      <AGPModal
        isOpen={modalAction !== null}
        onClose={closeModal}
        title={
          modalAction === "create"
            ? "Create Role"
            : modalAction === "update"
            ? "Update Role"
            : modalAction === "delete"
            ? "Delete Role"
            : modalAction === "detail"
            ? "Role Detail"
            : ""
        }
      >
        {modalAction === "create" && (
          <CreateRole onRoleCreated={handleRoleCreated} onClose={closeModal} departments={departments} />
        )}
        {modalAction === "update" && (
          <RoleUpdate
            roleId={currentRole?.id}
            onClose={closeModal}
            onRoleUpdated={handleUpdateRole}
            departments={departments}
          />
        )}
        {modalAction === "detail" && <RoleDetail role={currentRole} onClose={closeModal} />}
        {modalAction === "delete" && (
          <RoleDeleteConfirm
            role={currentRole}
            onClose={closeModal}
            removeRole={removeRoleFromList}
          />
        )}
      </AGPModal>
    </CContainer>
  );
};

export default RoleList;
