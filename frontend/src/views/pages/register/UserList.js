import React, { useEffect, useState } from 'react';
import {
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CContainer,
  CForm,
  CFormInput,
  CFormFeedback,
  CTooltip,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CSpinner,
  CFormSelect
} from '@coreui/react';
import { cilUserPlus } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import axiosInstance from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    department: '',
    is_active: true,
  });
  const [formValid, setFormValid] = useState(true);
  const [loading, setLoading] = useState({
    detail: false,
    creating: false,
    updating: false,
  });
  const [modalsVisibility, setModalsVisibility] = useState({
    showCreateModal: false,
    showUpdateModal: false,
    showDetailsModal: false,
    showDeleteModal: false,
  });
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const notify = (msg) => toast(msg);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('api/users/list/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        notify('Failed to fetch users.');
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('api/users/departments/');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        notify('Failed to fetch departments.');
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('api/users/roles/');
        setRoles(response.data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        notify('Failed to fetch roles.');
      }
    };

    fetchUsers();
    fetchDepartments();
    fetchRoles();
  }, []);

  const toggleModal = (modalName) => {
    setModalsVisibility((prevState) => ({
      ...prevState,
      [modalName]: !prevState[modalName],
    }));
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`api/users/delete/${selectedUserToDelete.id}/`);
      notify('User deleted successfully!');
      setUsers((prev) => prev.filter((user) => user.id !== selectedUserToDelete.id));
    } catch (err) {
      console.error('Error deleting user:', err);
      notify('Failed to delete user.');
    } finally {
      toggleModal('showDeleteModal');
    }
  };

  const handleShowDetails = async (id) => {
    setLoading((prev) => ({ ...prev, detail: true }));
    try {
      const response = await axiosInstance.get(`api/users/detail/${id}/`);
      setSelectedUser(response.data);
      toggleModal('showDetailsModal');
    } catch (err) {
      console.error('Error fetching user details:', err);
      notify('Failed to fetch user details.');
    } finally {
      setLoading((prev) => ({ ...prev, detail: false }));
    }
  };

  const handleUpdate = async () => {
    if (!validateForm(newUser)) {
      setFormValid(false);
      return;
    }

    setLoading((prev) => ({ ...prev, updating: true }));
    try {
      const response = await axiosInstance.put(`api/users/update/${selectedUser.id}/`, newUser);
      notify(response.data.message || 'User updated successfully!');
      setUsers((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? selectedUser : user))
      );
      toggleModal('showUpdateModal');
    } catch (err) {
      console.log(err);
      notify('Failed to update user.');
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  const handleCreate = async () => {
    if (!validateForm(newUser)) {
      setFormValid(false);
      return;
    }

    setLoading((prev) => ({ ...prev, creating: true }));
    try {
      const response = await axiosInstance.post('api/users/list/', newUser);
      notify('User created successfully!');
      if (response.data && response.data.id) {
        setUsers((prev) => [...prev, response.data]);
      } else {
        notify('Unexpected response format. Please reload to see the changes.');
      }
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        department: '',
        is_active: true,
      });
      toggleModal('showCreateModal');
    } catch (err) {
      console.error('Error creating user:', err);
      notify('Failed to create user.');
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  const validateForm = (user) => {
    return user?.first_name.trim() && user?.last_name.trim() && user?.email.trim() && user?.email.includes('@');
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
    setFormValid(true);
  };

  const handleStatusChange = async (userId, status) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.is_active = status === 'Active';
        const response = await axiosInstance.put(`api/users/update/${userId}/`, user);
        setUsers((prevUsers) => prevUsers.map(u => u.id === userId ? { ...u, is_active: user.is_active } : u));
        notify('User status updated successfully!');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      notify('Failed to update user status.');
    }
  };

  return (
    <CContainer fluid style={{ padding: '1rem', backgroundColor: '#f8f9fa' }}>
      <CTooltip content="Add User" placement="top">
        <CButton color="primary" onClick={() => toggleModal('showCreateModal')} className="mb-3 float-end">
          <CIcon icon={cilUserPlus} />
        </CButton>
      </CTooltip>
      <CTable id="userTable" hover striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>First Name</CTableHeaderCell>
            <CTableHeaderCell>Last Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Department</CTableHeaderCell>
            <CTableHeaderCell>Role</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users.map((user) => (
            <CTableRow key={user.id}>
              <CTableDataCell>{user.first_name}</CTableDataCell>
              <CTableDataCell>{user.last_name}</CTableDataCell>
              <CTableDataCell>{user.email}</CTableDataCell>
              <CTableDataCell>{user.department ? user.department.name : 'N/A'}</CTableDataCell>
              <CTableDataCell>{user.role ? user.role.name : 'N/A'}</CTableDataCell>
              <CTableDataCell>
                <CFormSelect
                  value={user.is_active ? 'Active' : 'Inactive'}
                  onChange={(e) => handleStatusChange(user.id, e.target.value)}
                  aria-label="User Status"
                  style={{ width: '100px' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </CFormSelect>
              </CTableDataCell>
              <CTableDataCell>
                <CTooltip content="View user details" placement="top">
                  <CButton color="info" className="me-2" onClick={() => handleShowDetails(user.id)}>
                    Details
                  </CButton>
                </CTooltip>
                <CTooltip content="Update user information" placement="top">
                  <CButton color="warning" className="me-2" onClick={() => setSelectedUser(user) && toggleModal('showUpdateModal')}>
                    Update
                  </CButton>
                </CTooltip>
                <CTooltip content="Delete this user" placement="top">
                  <CButton color="danger" onClick={() => setSelectedUserToDelete(user) && toggleModal('showDeleteModal')}>
                    Delete
                  </CButton>
                </CTooltip>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Create Modal */}
      <CModal visible={modalsVisibility.showCreateModal} onClose={() => toggleModal('showCreateModal')}>
        <CModalHeader>
          <CModalTitle>Create New User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="First Name"
              name="first_name"
              value={newUser.first_name}
              onChange={handleChange}
              isInvalid={!formValid && !newUser.first_name}
            />
            <CFormInput
              label="Last Name"
              name="last_name"
              value={newUser.last_name}
              onChange={handleChange}
              isInvalid={!formValid && !newUser.last_name}
            />
            <CFormInput
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleChange}
              isInvalid={!formValid && !newUser.email}
            />
            <CFormSelect
              label="Role"
              name="role"
              value={newUser.role}
              onChange={handleChange}
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </CFormSelect>
            <CFormSelect
              label="Department"
              name="department"
              value={newUser.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </CFormSelect>
            <CFormSelect
              label="Status"
              name="is_active"
              value={newUser.is_active ? 'Active' : 'Inactive'}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </CFormSelect>
            {!formValid && <CFormFeedback invalid>Please fill in all fields correctly.</CFormFeedback>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showCreateModal')}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleCreate}>
            {loading.creating ? <CSpinner component="span" size="sm" /> : 'Create'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Update Modal */}
      <CModal visible={modalsVisibility.showUpdateModal} onClose={() => toggleModal('showUpdateModal')}>
        <CModalHeader>
          <CModalTitle>Update User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="First Name"
              name="first_name"
              value={newUser.first_name}
              onChange={handleChange}
            />
            <CFormInput
              label="Last Name"
              name="last_name"
              value={newUser.last_name}
              onChange={handleChange}
            />
            <CFormInput
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleChange}
            />
            <CFormSelect
              label="Role"
              name="role"
              value={newUser.role}
              onChange={handleChange}
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </CFormSelect>
            <CFormSelect
              label="Department"
              name="department"
              value={newUser.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </CFormSelect>
            <CFormSelect
              label="Status"
              name="is_active"
              value={newUser.is_active ? 'Active' : 'Inactive'}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showUpdateModal')}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleUpdate}>
            {loading.updating ? <CSpinner component="span" size="sm" /> : 'Update'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Details Modal */}
      <CModal visible={modalsVisibility.showDetailsModal} onClose={() => toggleModal('showDetailsModal')}>
        <CModalHeader>
          <CModalTitle>User Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading.detail ? (
            <CSpinner component="span" size="sm" />
          ) : (
            selectedUser && (
              <div>
                <p><strong>First Name:</strong> {selectedUser.first_name}</p>
                <p><strong>Last Name:</strong> {selectedUser.last_name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role ? selectedUser.role.name : 'N/A'}</p>
                <p><strong>Department:</strong> {selectedUser.department ? selectedUser.department.name : 'N/A'}</p>
                <p><strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            )
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showDetailsModal')}>Close</CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
      <CModal visible={modalsVisibility.showDeleteModal} onClose={() => toggleModal('showDeleteModal')}>
        <CModalHeader>
          <CModalTitle>Delete User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this user?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showDeleteModal')}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete}>
            {loading.deleting ? <CSpinner component="span" size="sm" /> : 'Delete'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default UserList;
