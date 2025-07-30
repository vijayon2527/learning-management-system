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
  CFormSwitch,
  CButton,
} from "@coreui/react";
import { CIcon } from "@coreui/icons-react";
import { toast } from "react-toastify";

import { cilUserPlus, cilPen, cilTrash } from "@coreui/icons";

const ConfirmStatusModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <AGPModal isOpen={isOpen} onClose={onClose} title="Confirm Action">
      <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>{message}</p>
      <div className="d-flex justify-content-end gap-2">
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="success" onClick={onConfirm}>
          Confirm
        </CButton>
      </div>
    </AGPModal>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null); // disable switch while saving
  const [errorMsg, setErrorMsg] = useState("");

  const [statusModal, setStatusModal] = useState({
    open: false,
    userId: null,
    currentStatus: false,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const response = await axiosInstance.get("api/users/list/");
        const data = response.data;
        const userArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.users)
          ? data.users
          : [];
        setUsers(userArray);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setErrorMsg("Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user creation
  const handleUserCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  // Handle user update
  const handleUpdateUser = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Remove user from the list
  const removeUserFromList = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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

  const confirmToggleStatus = (userId, currentStatus) => {
    setStatusModal({
      open: true,
      userId,
      currentStatus,
    });
  };

  const handleConfirmStatus = async () => {
  const { userId, currentStatus } = statusModal;
  const newStatus = !currentStatus;

  setStatusModal({ open: false, userId: null, currentStatus: false });

  // optimistic UI update
  setUsers((prev) =>
    prev.map((u) => (u.id === userId ? { ...u, is_active: newStatus } : u))
  );
  setTogglingId(userId);
  setErrorMsg("");

  try {
    const resp = await axiosInstance.patch(
      `api/users/activate-deactivate/${userId}/`,
      { is_active: newStatus }
    );

    const updatedUser = resp.data?.user || resp.data;
    if (updatedUser?.id) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      toast.success(
        `User ${newStatus ? "activated" : "deactivated"} successfully!`
      );
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    setErrorMsg("Failed to update status.");
    toast.error("Failed to update user status!");
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: currentStatus } : u))
    );
  } finally {
    setTogglingId(null);
  }
};


  return (
    <CContainer fluid style={{ padding: "1rem", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">User List</h2>
        <CTooltip content="Add User" placement="top">
          <CButton color="primary" onClick={() => handleAction("create")}>
            <CIcon icon={cilUserPlus} />
          </CButton>
        </CTooltip>
      </div>

      {errorMsg && (
        <div className="text-danger mb-2" style={{ fontSize: "0.9rem" }}>
          {errorMsg}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <CSpinner color="primary" />
        </div>
      ) : (
        <CTable borderColor="dark" striped responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Gender</CTableHeaderCell>
              <CTableHeaderCell>User Type</CTableHeaderCell>
              <CTableHeaderCell>Role</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map((user, index) => {
              const roleText =
                user.role ?? user.platform_user?.role ?? user.student?.role ?? "N/A";

              const switchClass = user.is_active ? "status-toggle active" : "status-toggle inactive";

              const switchStyle = user.is_active
                ? { "--cui-form-switch-checked-bg": "#28a745" }
                : {
                    "--cui-form-switch-bg": "#dc3545",
                    "--cui-form-switch-border-color": "#dc3545",
                  };

              return (
                <CTableRow key={user.id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>

                  <CTableDataCell>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAction("detail", user);
                      }}
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {user.first_name} {user.last_name}
                    </a>
                  </CTableDataCell>

                  <CTableDataCell>{user.email || "N/A"}</CTableDataCell>
                  <CTableDataCell>{user.gender || "N/A"}</CTableDataCell>
                  <CTableDataCell>{user.user_type || "N/A"}</CTableDataCell>
                  <CTableDataCell>{roleText}</CTableDataCell>

                  <CTableDataCell>
                    <CFormSwitch
                      id={`status-switch-${user.id}`}
                      checked={!!user.is_active}
                      disabled={togglingId === user.id}
                      onChange={() => confirmToggleStatus(user.id, user.is_active)}
                      label=""
                      className={switchClass}
                      style={switchStyle}
                    />
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <CTooltip content="Update">
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => handleAction("update", user)}
                        >
                          <CIcon icon={cilPen} style={{ height: 18, width: 18 }} />
                        </button>
                      </CTooltip>
                      <CTooltip content="Delete">
                        <button
                          className="icon-btn delete-btn"
                          onClick={() => handleAction("delete", user)}
                        >
                          <CIcon icon={cilTrash} style={{ height: 18, width: 18 }} />
                        </button>
                      </CTooltip>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              );
            })}
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

        {modalAction === "detail" && <UserDetail userId={currentUser?.id} />}

        {modalAction === "delete" && (
          <UserDeleteConfirm
            user={currentUser}
            onClose={closeModal}
            removeUser={removeUserFromList}
          />
        )}
      </AGPModal>

      {/* Confirm Activate/Deactivate Modal */}
      <ConfirmStatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, userId: null, currentStatus: false })}
        onConfirm={handleConfirmStatus}
        message={`Are you sure you want to ${
          statusModal.currentStatus ? "deactivate" : "activate"
        } this user?`}
      />
    </CContainer>
  );
};

export default UserList;
