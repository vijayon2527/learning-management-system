import React, { useState, useEffect } from "react";
import {
  CForm,
  CFormInput,
  CButton,
  CInputGroup,
  CSpinner,
  CFormFeedback,
  CFormSelect,
  CContainer,
} from "@coreui/react";
import Select from "react-select";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const notify = (message) => toast(message);

const CreateRole = ({ roleId, onRoleCreated, onClose }) => {
  const [formData, setFormData] = useState({
    roleName: '',
    roleDescription: '',
    departmentId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [formErrors, setFormErrors] = useState({
    roleName: '',
    departmentId: '',
  });
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isFormValidated, setIsFormValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch departments on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("api/users/departments/");
        setDepartments(response.data);
      } catch (err) {
        notify("Failed to fetch departments.");
      }
  
      try {
        const response = await axiosInstance.get("api/users/permissions-list/");
        setPermissions(response.data);
      } catch (err) {
        notify("Failed to fetch permissions.");
      }
    };
  
    fetchData();
  }, []);
  


  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setFormErrors((prevState) => ({ ...prevState, [name]: "" }));
  };


  const handlePermissionsChange = (selectedOptions) => {
    // Handle the "Select All" functionality
    if (selectedOptions.some((option) => option.value === "select_all")) {
      if (selectedPermissions.length === permissions.length) {
        setSelectedPermissions([]); // Deselect all
      } else {
        setSelectedPermissions(permissions.map((perm) => perm.id)); // Select all
      }
    } else {
      setSelectedPermissions(selectedOptions.map((option) => option.value));
    }
  };


  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const errors = {};

    if (!formData.roleName.trim()) {
      errors.roleName = "Role name is required.";
      isValid = false;
    }
    if (!formData.departmentId) {
      errors.departmentId = "Department selection is required.";
      isValid = false;
    }

    setFormErrors(errors);
    if (!isValid) return;

    setIsLoading(true);

    try {
      const requestData = {
        name: formData.roleName,
        description: formData.roleDescription,
        department: formData.departmentId, // Pass department id
        permissions: selectedPermissions.length ? selectedPermissions : [], // Ensure array of permission IDs is passed
      };

      console.log("Sending Request Data:", requestData); // Debugging log

      // If roleId exists (i.e., updating an existing role), send a PUT request to update
      const url = roleId ? `api/users/assign-permissions/${roleId}/` : "api/users/create-role/";
      const response = await axiosInstance.post(url, requestData);

      // Notify user that the role was created
      notify("Role with permissions created successfully!");

      // After role creation, fetch the updated role list (or single role if needed)
      if (onRoleCreated) onRoleCreated(); // Refresh role list or update state

      onClose();
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message); // Debugging log
      notify("Failed to create role.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CContainer>
      <CForm onSubmit={handleFormSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="roleName" className="form-label">
            Role Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </label>
          <CInputGroup>
            <CFormInput
              id="roleName"
              type="text"
              placeholder="Enter role name"
              name="roleName"
              value={formData.roleName}
              onChange={handleInputChange}
              invalid={!!formErrors.roleName}
              valid={isFormValidated && !!formData.roleName.trim()}
              required
            />
            <CFormFeedback invalid>{formErrors.roleName}</CFormFeedback>
            <CFormFeedback valid>Looks good!</CFormFeedback>
          </CInputGroup>
        </div>

        <div className="mb-3">
          <label htmlFor="departmentId" className="form-label">
            Department <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </label>
          <CInputGroup>
            <CFormSelect
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              invalid={!!formErrors.departmentId}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </CFormSelect>
            <CFormFeedback invalid>{formErrors.departmentId}</CFormFeedback>
          </CInputGroup>
        </div>

        <div className="mb-3">
          <label htmlFor="roleDescription" className="form-label">
            Role Description
          </label>
          <CFormInput
            id="roleDescription"
            type="text"
            placeholder="Enter role description"
            name="roleDescription"
            value={formData.roleDescription}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="permissions" className="form-label">
            Assign Permissions
          </label>
          <Select
            id="permissions"
            isMulti
            options={[
              { value: "select_all", label: "Select All" },
              ...permissions.map((perm) => ({
                value: perm.id,
                label: perm.name,
              })),
            ]}
            onChange={handlePermissionsChange}
            placeholder="Select Permissions"
            value={selectedPermissions.map((permId) => ({
              value: permId,
              label: permissions.find((perm) => perm.id === permId)?.name || "Unknown",
            }))}
          />
        </div>
         

        <CButton
          type="submit"
          color="info"
          className="w-100"
          disabled={isLoading}
        >
          {isLoading ? <CSpinner size="sm" /> : 'Create Role'}
        </CButton>
      </CForm>
    </CContainer>
  );
};

export default CreateRole;