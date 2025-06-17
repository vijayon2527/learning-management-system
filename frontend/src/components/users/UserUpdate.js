import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  CContainer,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CAlert,
  CCol,
  CFormLabel,
} from "@coreui/react";

const UserUpdate = ({ userId, onUserUpdated, onClose }) => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department_id: "",
    role_id: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userResponse = await axiosInstance.get(`/api/users/detail/${userId}/`);
        setUserData({
          first_name: userResponse.data.first_name,
          last_name: userResponse.data.last_name,
          email: userResponse.data.email,
          department_id: userResponse.data.department?.id || "",
          role_id: userResponse.data.role?.id || "",
          is_active: userResponse.data.is_active,
        });
      } catch (err) {
        setError("Error fetching user data.");
        toast.error("Error fetching user data.");
      }
      setLoading(false);
    };

    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get("/api/users/departments/");
        setDepartments(response.data);
      } catch (err) {
        setError("Error fetching departments.");
        toast.error("Error fetching departments."); 
      }
    };

    fetchUserData();
    fetchDepartments();
  }, [userId]);

  useEffect(() => {
    if (userData.department_id) {
      const fetchRoles = async () => {
        try {
          const response = await axiosInstance.get(`/api/users/departments/${userData.department_id}/roles/`);
          setRoles(response.data);
        } catch (err) {
          setError("Error fetching roles.");
          toast.error("Error fetching roles."); 
        }
      };
      fetchRoles();
    }
  }, [userData.department_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      setLoading(true);
      try {
        const response = await axiosInstance.put(`/api/users/update/${userId}/`, userData);
        onUserUpdated(response.data); 
        onClose(); 
        toast.success("User updated successfully!"); 
      } catch (err) {
        setError("Error updating user details.");
        toast.error("Error updating user details."); 
      } finally {
        setLoading(false);
      }
    }
    setValidated(true);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <CContainer fluid>
      {error && <CAlert color="danger">{error}</CAlert>}
      <CForm
        className="row g-3 needs-validation"
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <CCol md={16}>
          <CFormLabel>
            First Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="first_name"
            value={userData.first_name}
            onChange={handleInputChange}
            required
            feedbackInvalid="First name is required."
          />
        </CCol>
        <CCol md={16}>
          <CFormLabel>
            Last Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            name="last_name"
            value={userData.last_name}
            onChange={handleInputChange}
            required
            feedbackInvalid="Last name is required."
          />
        </CCol>
        <CCol md={16}>
          <CFormLabel>
            Email(User Name) <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormInput
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            required
            feedbackInvalid="Please provide a valid email."
          />
        </CCol>
        <CCol md={16}>
          <CFormLabel>
            Department <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
          </CFormLabel>
          <CFormSelect
            name="department_id"
            value={userData.department_id}
            onChange={handleInputChange}
            required
            feedbackInvalid="Please select a department."
          >
            <option value="">Select Department</option>
            {departments.length > 0 ? (
              departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))
            ) : (
              <option disabled>No departments available</option>
            )}
          </CFormSelect>
        </CCol>
        {userData.department_id && roles.length > 0 && (
          <CCol md={16}>
            <CFormLabel>
              Role <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
            </CFormLabel>
            <CFormSelect
              name="role_id"
              value={userData.role_id}
              onChange={handleInputChange}
              required
              feedbackInvalid="Please select a role."
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        )}

        <CButton color="primary" type="submit" className="mt-3">
          Save Changes
        </CButton>
        
      </CForm>
    </CContainer>
  );
};

export default UserUpdate;
