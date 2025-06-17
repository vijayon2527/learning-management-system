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
  CRow,
} from "@coreui/react";
import ProfilePicture from "./ProfilePicture";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    department_id: "",
    role_id: "",
    date_of_birth: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli", "Daman and Diu", "Lakshadweep", 
    "National Capital Territory of Delhi", "Puducherry"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/users/profile/");
        const data = response.data.user;
        setUserData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          department_id: data.department?.id || "",
          role_id: data.role?.id || "",
          date_of_birth: data.date_of_birth || "",
          address_line_1: data.address_line_1 || "",
          address_line_2: data.address_line_2 || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          postal_code: data.postal_code || "",
          is_active: data.is_active,
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
  }, []);

  useEffect(() => {
    if (userData.department_id) {
      const fetchRoles = async () => {
        try {
          const response = await axiosInstance.get(
            `/api/users/departments/${userData.department_id}/roles/`
          );
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
    setLoading(true);
    try {
      const response = await axiosInstance.put("/api/users/profile/", userData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      setError("Error updating profile.");
      toast.error("Error updating profile.");
    } finally {
      setLoading(false);
    }
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
      <CContainer className="d-flex justify-content-center align-items-center flex-column mb-4">
        <h1>{userData.first_name || "User"}'s Profile</h1>
      </CContainer>
      {error && <CAlert color="danger">{error}</CAlert>}
      <CRow>
        <CCol md={6}>
          <CForm className="row g-3" onSubmit={handleSubmit}>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="first_name"
                  label="First Name"
                  value={userData.first_name}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="last_name"
                  label="Last Name"
                  value={userData.last_name}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  type="email"
                  name="email"
                  label="Email"
                  value={userData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="mobile"
                  label="Mobile"
                  value={userData.mobile}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormSelect
                  name="department_id"
                  label="Department"
                  value={userData.department_id}
                  onChange={handleInputChange}
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  name="role_id"
                  label="Role"
                  value={userData.role_id}
                  onChange={handleInputChange}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  type="date"
                  name="date_of_birth"
                  label="Date of Birth"
                  value={userData.date_of_birth}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="address_line_1"
                  label="Address Line 1"
                  value={userData.address_line_1}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="address_line_2"
                  label="Address Line 2"
                  value={userData.address_line_2}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="city"
                  label="City"
                  value={userData.city}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormSelect
                  name="state"
                  label="State"
                  value={userData.state}
                  onChange={handleInputChange}
                >
                  {states.map((state, index) => (
                    <option key={index} value={state}>
                      {state}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="country"
                  label="Country"
                  value={userData.country}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  name="postal_code"
                  label="Postal Code"
                  value={userData.postal_code}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>
            <CButton color="primary" type="submit" className="mt-3">
              Save Changes
            </CButton>
          </CForm>
        </CCol>
        <CCol md={6}>
          <ProfilePicture />
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default UserProfile;
