import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

import Register from "./Register";
import UserUpdate from "./UserUpdate";
import UserDetail from "./UserDetail";
import UserDeleteConfirm from "./UserDeleteConfirm";
import AGPModal from "../common/AGPModal";
import {
  CContainer,
  CTooltip,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
  CFormSelect,
  CButton,
} from "@coreui/react";
import { CIcon } from "@coreui/icons-react";
import { cilUserPlus,cilPen,cilTrash } from "@coreui/icons";
import PermissionWrapper from "../common/RoleWrapper";
import Permissions from "../common/Roles";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the list of users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("api/users/list/");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user creation
  const handleUserCreated = (newUser) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);
  };

  // Handle user update
  const handleUpdateUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  // Remove user from the list
  const removeUserFromList = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  // Handle action button click (create, update, detail, delete)
  const handleAction = (action, user = null) => {
    setModalAction(action);
    setCurrentUser(user);
  };

  // Close the modal
  const closeModal = () => {
    setModalAction(null);
    setCurrentUser(null);
  };

  // Handle user status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const isActive = newStatus === "Active";
      const confirmChange = window.confirm(
        `Are you sure you want to mark this user as ${isActive ? "Active" : "Inactive"}?`
      );
      if (confirmChange) {
        await axiosInstance.patch(`api/users/activate-deactivate/${userId}/`, {
          is_active: isActive,
        });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId
              ? { ...user, is_active: isActive }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <CContainer fluid style={{ padding: "1rem", backgroundColor: "#f8f9fa" }}>
      <PermissionWrapper requiredPermission={Permissions.ADD_USER}>
        <CTooltip content="Add User" placement="top">
          <CButton
            color="primary"
            onClick={() => handleAction("create")}
            className="mb-3 float-end"
          >
            <CIcon icon={cilUserPlus} />
          </CButton>
        </CTooltip>
    </PermissionWrapper>
      {/* User List Table */}
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
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Department</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
              <PermissionWrapper requiredPermission={Permissions.CHANGE_USER}>
                <CTableHeaderCell>Status</CTableHeaderCell>
              </PermissionWrapper>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map((user, index) => (
              <CTableRow key={user.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
              <PermissionWrapper requiredPermission={Permissions.VIEW_USER}>
                <CTableDataCell>
                  <a
                    href="#"
                    onClick={() => handleAction("detail", user)}
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    {user.first_name} {user.last_name}
                  </a>
                </CTableDataCell>
                </PermissionWrapper>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>{user.department ? user.department.name : "N/A"}</CTableDataCell>
                <CTableDataCell>{user.role ? user.role.name : "N/A"}</CTableDataCell>
                <PermissionWrapper requiredPermission={Permissions.CHANGE_USER}>
                  <CTableDataCell>
                    <CFormSelect
                      value={user.is_active ? "Active" : "Inactive"}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      aria-label="User Status"
                      style={{
                        backgroundColor: user.is_active ? "#28a745" : "#dc3545",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </CFormSelect>
                  </CTableDataCell>
                </PermissionWrapper>
                <CTableDataCell>
                  <PermissionWrapper requiredPermission={Permissions.CHANGE_USER}>
                     <CIcon
                      icon={cilPen}
                      onClick={() => handleAction("update", user)}
                      style={{ fontSize: "20px", color: "blue", cursor: "pointer", marginRight: "10px" }}
                      title="Update"
                    />
                  </PermissionWrapper>
                  <PermissionWrapper requiredPermission={Permissions.DELETE_USER}>
                    <CIcon
                      icon={cilTrash}
                      onClick={() => handleAction("delete", user)}
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

      {/* User Modals */}
      <AGPModal
        isOpen={modalAction !== null}
        onClose={closeModal}
        title={
          modalAction === "create"
            ? "Register User"
            : modalAction === "update"
            ? "Update User"
            : modalAction === "detail"
            ? "User Detail"
            : modalAction === "delete"
            ? "Delete User"
            : ""
        }
      >
        {modalAction === "create" && (
          <Register onUserCreated={handleUserCreated} onClose={closeModal} />
        )}

        {modalAction === "update" && (
          <UserUpdate
            userId={currentUser?.id}
            onClose={closeModal}
            onUserUpdated={handleUpdateUser}
          />
        )}

        {modalAction === "detail" && (
          <UserDetail userId={currentUser?.id} />
        )}

        {modalAction === "delete" && (
          <UserDeleteConfirm
            user={currentUser}
            onClose={closeModal}
            removeUser={removeUserFromList}
          />
        )}
      </AGPModal>
    </CContainer>
  );
};

export default UserList;
