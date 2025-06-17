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
import { CIcon } from '@coreui/icons-react';
import { cilUserPlus } from '@coreui/icons';
import { toast } from 'react-toastify';
import axiosInstance from '../../../utils/axiosInstance';
import PermissionWrapper from '../../../components/common/PermissionWrapper';
import Permissions from '../../../components/common/Permissions';

const CategoryList = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    gst_number: '',
    status: 'ACTIVE',
    categories: [],
  });
  const [formValid, setFormValid] = useState(true);
  const [loading, setLoading] = useState({ detail: false, creating: false, updating: false });
  const [modalsVisibility, setModalsVisibility] = useState({
    showCreateModal: false,
    showUpdateModal: false,
    showDetailsModal: false,
    showDeleteModal: false,
  });
  const [selectedEntryToDelete, setSelectedEntryToDelete] = useState(null);
  const [categories, setCategories] = useState([]);

  const notify = (msg) => toast(msg);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('api/material/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        notify('Failed to fetch categories.');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axiosInstance.get('api/entries/'); // Adjust API endpoint
        setEntries(response.data);
      } catch (error) {
        console.error('Error fetching entries:', error);
        notify('Failed to fetch entries.');
      }
    };
    fetchEntries();
  }, []);

  const toggleModal = (modalName) => {
    setModalsVisibility((prevState) => ({
      ...prevState,
      [modalName]: !prevState[modalName],
    }));
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`api/entries/${selectedEntryToDelete.id}/`);
      notify('Entry deleted successfully!');
      setEntries((prev) => prev.filter((entry) => entry.id !== selectedEntryToDelete.id));
    } catch (err) {
      console.error('Error deleting entry:', err);
      notify('Failed to delete entry.');
    } finally {
      toggleModal('showDeleteModal');
    }
  };

  const handleShowDetails = async (id) => {
    setLoading((prev) => ({ ...prev, detail: true }));
    try {
      const response = await axiosInstance.get(`api/entries/${id}/`);
      setSelectedEntry(response.data);
      toggleModal('showDetailsModal');
    } catch (err) {
      console.error('Error fetching entry details:', err);
      notify('Failed to fetch entry details.');
    } finally {
      setLoading((prev) => ({ ...prev, detail: false }));
    }
  };

  const handleUpdateDetails = async (id) => {
    setLoading((prev) => ({ ...prev, detail: true }));
    try {
      const response = await axiosInstance.get(`api/entries/${id}/`);
      setSelectedEntry(response.data);
      toggleModal('showUpdateModal');
    } catch (err) {
      console.error('Error fetching entry details:', err);
      notify('Failed to fetch entry details.');
    } finally {
      setLoading((prev) => ({ ...prev, detail: false }));
    }
  };

  const handleDeleteConfirmation = (entry) => {
    setSelectedEntryToDelete(entry);
    toggleModal('showDeleteModal');
  };

  const validateForm = (entry) => {
    return (
      entry?.name.trim() &&
      entry?.email.trim() &&
      entry?.phone_number.trim() &&
      entry?.address.trim() &&
      entry?.gst_number.trim() &&
      entry?.status.trim()
    );
  };

  const handleUpdate = async () => {
    if (!validateForm(selectedEntry)) {
      setFormValid(false);
      return;
    }

    setLoading((prev) => ({ ...prev, updating: true }));
    try {
      const response = await axiosInstance.put(`api/entries/${selectedEntry.id}/`, selectedEntry);
      notify(response.data.message || 'Entry updated successfully!');
      setEntries((prev) =>
        prev.map((entry) => (entry.id === selectedEntry.id ? selectedEntry : entry))
      );
      toggleModal('showUpdateModal');
    } catch (err) {
      console.log(err);
      notify('Failed to update entry.');
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  const handleCreate = async () => {
    if (!validateForm(newEntry)) {
      setFormValid(false);
      return;
    }

    setLoading((prev) => ({ ...prev, creating: true }));
    try {
      const response = await axiosInstance.post('api/entries/', newEntry);
      notify('Entry created successfully!');
      if (response.data && response.data.id) {
        setEntries((prev) => [...prev, response.data]);
      } else {
        notify('Unexpected response format. Please reload to see the changes.');
      }
      setNewEntry({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        gst_number: '',
        status: 'ACTIVE',
        categories: [],
      });
      toggleModal('showCreateModal');
    } catch (err) {
      console.error('Error creating entry:', err);
      notify('Failed to create entry.');
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  const handleChange = (e) => {
    setNewEntry({ ...newEntry, name: e.target.value });
    setFormValid(true);
  };

  return (
    <CContainer fluid style={{ padding: '1rem', backgroundColor: '#f8f9fa' }}>
      <PermissionWrapper requiredPermission={Permissions.ADD_VENDOR}>
        <CTooltip content="Add Entry" placement="top">
          <CButton color="primary" onClick={() => toggleModal('showCreateModal')} className="mb-3 float-end">
            <CIcon icon={cilUserPlus} />
          </CButton>
        </CTooltip>
      </PermissionWrapper>

      {/* DataTable */}
      <CTable id="categoryTable" borderColor="dark" hover striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {entries.map((entry, index) => (
            <CTableRow key={entry.id}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{entry.name}</CTableDataCell>
              <CTableDataCell>{entry.email}</CTableDataCell>
              <CTableDataCell>{entry.phone_number}</CTableDataCell>
              <CTableDataCell>{entry.status}</CTableDataCell>
              <CTableDataCell>
              <PermissionWrapper requiredPermission={Permissions.VIEW_VENDOR}>
                <CTooltip content="View Entry Details" placement="top">
                  <CButton color="primary" size="sm" className="me-2" onClick={() => handleShowDetails(entry.id)}>
                    Details
                  </CButton>
                </CTooltip>
              </PermissionWrapper>
              <PermissionWrapper requiredPermission={Permissions.CHANGE_VENDOR}>
                <CTooltip content="Update Entry" placement="top">
                  <CButton color="warning" size="sm" className="me-2" onClick={() => handleUpdateDetails(entry.id)}>
                    Update
                  </CButton>
                </CTooltip>
              </PermissionWrapper>
              <PermissionWrapper requiredPermission={Permissions.DELETE_VENDOR}>
                <CTooltip content="Delete this Entry" placement="top">
                  <CButton color="danger" size="sm" onClick={() => handleDeleteConfirmation(entry)}>
                    Delete
                  </CButton>
                </CTooltip>
              </PermissionWrapper>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Create Entry Modal */}
      <CModal visible={modalsVisibility.showCreateModal} onClose={() => toggleModal('showCreateModal')}>
        <CModalHeader onClose={() => toggleModal('showCreateModal')}>
          <CModalTitle>Create New Entry</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              id="name"
              label="Name"
              placeholder="Enter name"
              value={newEntry.name}
              onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
              required
              invalid={!formValid}
            />
            <CFormFeedback invalid>Name is required.</CFormFeedback>

            <CFormInput
              type="email"
              id="email"
              label="Email"
              placeholder="Enter email"
              value={newEntry.email}
              onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
              required
              invalid={!formValid}
            />
            <CFormFeedback invalid>Email is required.</CFormFeedback>

            <CFormInput
              type="tel"
              id="phone_number"
              label="Phone Number"
              placeholder="Enter phone number"
              value={newEntry.phone_number}
              onChange={(e) => setNewEntry({ ...newEntry, phone_number: e.target.value })}
              required
              invalid={!formValid}
            />
            <CFormFeedback invalid>Phone number is required.</CFormFeedback>

            <CFormInput
              type="text"
              id="address"
              label="Address"
              placeholder="Enter address"
              value={newEntry.address}
              onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })}
              required
              invalid={!formValid}
            />
            <CFormFeedback invalid>Address is required.</CFormFeedback>

            <CFormInput
              type="text"
              id="gst_number"
              label="GST Number"
              placeholder="Enter GST number"
              value={newEntry.gst_number}
              onChange={(e) => setNewEntry({ ...newEntry, gst_number: e.target.value })}
              required
            />
            <CFormFeedback invalid>GST number is required.</CFormFeedback>

            <CFormSelect
              id="status"
              label="Status"
              value={newEntry.status}
              onChange={(e) => setNewEntry({ ...newEntry, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </CFormSelect>

            <CFormSelect
              id="categories"
              label="Categories"
              multiple
              value={newEntry.categories}
              onChange={(e) =>
                setNewEntry({ ...newEntry, categories: [...e.target.selectedOptions].map((option) => option.value) })
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showCreateModal')}>Cancel</CButton>
          <CButton color="primary" onClick={handleCreate} disabled={loading.creating}>
            {loading.creating ? <CSpinner size="sm" /> : 'Create'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Update Entry Modal */}
      <CModal visible={modalsVisibility.showUpdateModal} onClose={() => toggleModal('showUpdateModal')}>
        <CModalHeader onClose={() => toggleModal('showUpdateModal')}>
          <CModalTitle>Update Entry</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              type="text"
              id="name"
              label="Name"
              placeholder="Enter name"
              value={selectedEntry?.name || ''}
              onChange={(e) => setSelectedEntry({ ...selectedEntry, name: e.target.value })}
              required
              invalid={!formValid}
            />
            <CFormFeedback invalid>Name is required.</CFormFeedback>

            <CFormInput
              type="email"
              id="email"
              label="Email"
              placeholder="Enter email"
              value={selectedEntry?.email || ''}
              onChange={(e) => setSelectedEntry({ ...selectedEntry, email: e.target.value })}
              required
            />

            <CFormInput
              type="tel"
              id="phone_number"
              label="Phone Number"
              placeholder="Enter phone number"
              value={selectedEntry?.phone_number || ''}
              onChange={(e) => setSelectedEntry({ ...selectedEntry, phone_number: e.target.value })}
              required
            />

            <CFormInput
              type="text"
              id="address"
              label="Address"
              placeholder="Enter address"
              value={selectedEntry?.address || ''}
              onChange={(e) => setSelectedEntry({ ...selectedEntry, address: e.target.value })}
              required
            />

            <CFormInput
              type="text"
              id="gst_number"
              label="GST Number"
              placeholder="Enter GST number"
              value={selectedEntry?.gst_number || ''}
              onChange={(e) => setSelectedEntry({ ...selectedEntry, gst_number: e.target.value })}
              required
            />

            <CFormSelect
              id="status"
              label="Status"
              value={selectedEntry?.status || 'ACTIVE'}
              onChange={(e) => setSelectedEntry({ ...selectedEntry, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </CFormSelect>

            <CFormSelect
              id="categories"
              label="Categories"
              multiple
              value={selectedEntry?.categories || []}
              onChange={(e) =>
                setSelectedEntry({ ...selectedEntry, categories: [...e.target.selectedOptions].map((option) => option.value) })
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showUpdateModal')}>Cancel</CButton>
          <CButton color="primary" onClick={handleUpdate} disabled={loading.updating}>
            {loading.updating ? <CSpinner size="sm" /> : 'Update'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Category Details Modal */}
      <CModal visible={modalsVisibility.showDetailsModal} onClose={() => toggleModal('showDetailsModal')}>
        <CModalHeader onClose={() => toggleModal('showDetailsModal')}>
          <CModalTitle>Entry Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading.detail ? (
            <CSpinner />
          ) : (
            <div>
              <h5>{selectedEntry?.name}</h5>
              <p>Email: {selectedEntry?.email}</p>
              <p>Phone: {selectedEntry?.phone_number}</p>
              <p>Address: {selectedEntry?.address}</p>
              <p>GST Number: {selectedEntry?.gst_number}</p>
              <p>Status: {selectedEntry?.status}</p>
              <p>Categories: {selectedEntry?.categories.join(', ')}</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showDetailsModal')}>Close</CButton>
        </CModalFooter>
      </CModal>
      
      {/* Delete Confirmation Modal */}
      <CModal visible={modalsVisibility.showDeleteModal} onClose={() => toggleModal('showDeleteModal')}>
        <CModalHeader onClose={() => toggleModal('showDeleteModal')}>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this entry?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => toggleModal('showDeleteModal')}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete}>Delete</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default CategoryList;
