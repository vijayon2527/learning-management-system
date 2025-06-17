import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CFormLabel,
  CFormTextarea,
} from "@coreui/react";
import Select from "react-select";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const notify = (message) => toast(message);

const RoleUpdate = ({ roleId, onClose, onRoleUpdated, departments }) => {
  const { id } = useParams();
  const [role, setRole] = useState({
    name: "",
    description: "",
    department_id: "",
    permissions: [],
  });
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const roleToUse = roleId || id;
    if (!roleToUse) {
      setError("Role ID is missing.");
      setLoading(false);
      return;
    }

    const fetchRoleData = async () => {
      try {
        setLoading(true);
        const roleResponse = await axiosInstance.get(`/api/users/role-update/${roleToUse}/`);
        const permissionsResponse = await axiosInstance.get(`/api/users/permissions-list/`);

        if (roleResponse.data && roleResponse.data.role) {
          const { role: fetchedRole } = roleResponse.data;
          setRole({
            name: fetchedRole.name || "",
            description: fetchedRole.description || "",
            department_id: fetchedRole.department ? fetchedRole.department.id : "",
            permissions: fetchedRole.permissions || [],
          });

          setSelectedPermissions(fetchedRole.permissions.map((perm) => perm.id));
        } else {
          setError("Role not found.");
        }

        if (permissionsResponse.data) {
          setPermissions(permissionsResponse.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch role details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [roleId, id]);

  const handlePermissionsChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === "select_all")) {
      if (selectedPermissions.length === permissions.length) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions(permissions.map((perm) => perm.id));
      }
    } else {
      setSelectedPermissions(selectedOptions.map((option) => option.value));
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!role.name || role.name.trim() === "") {
      errors.name = "Role name is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      setValidated(true);
      return;
    }
    try {
      const updatedRole = { ...role, permissions: selectedPermissions };
      await axiosInstance.patch(`/api/users/role-update/${roleId || id}/`, updatedRole);
      notify("Role updated successfully!");
      if (onRoleUpdated) onRoleUpdated(updatedRole);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update role.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!role) return <div>Role data not found.</div>;

  return (
    <CContainer fluid>
      <CForm onSubmit={handleSubmit} noValidate validated={validated}>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Role Name <span style={{ color: "red" }}>*</span></CFormLabel>
            <CFormInput
              name="name"
              value={role.name}
              onChange={(e) => setRole({ ...role, name: e.target.value })}
              required
            />
            {fieldErrors.name && <div className="text-danger">{fieldErrors.name}</div>}
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Department <span style={{ color: "red" }}>*</span></CFormLabel>
            <CFormSelect
              name="department_id"
              value={role.department_id}
              onChange={(e) => setRole({ ...role, department_id: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Description</CFormLabel>
            <CFormTextarea
              name="description"
              value={role.description}
              onChange={(e) => setRole({ ...role, description: e.target.value })}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Assign Permissions</CFormLabel>
            <Select
              id="permissions"
              isMulti
              options={[
                { value: "select_all", label: "Select All" },
                ...permissions.map((perm) => ({ value: perm.id, label: perm.name })),
              ]}
              onChange={handlePermissionsChange}
              placeholder="Select Permissions"
              value={selectedPermissions.map((permId) => ({
                value: permId,
                label: permissions.find((perm) => perm.id === permId)?.name || "Unknown",
              }))}
            />
          </CCol>
        </CRow>
        <CButton type="submit" color="info" className="mt-3 w-100">Update Role</CButton>
      </CForm>
    </CContainer>
  );
};

export default RoleUpdate;
