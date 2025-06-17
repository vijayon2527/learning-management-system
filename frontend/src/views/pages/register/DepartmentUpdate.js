import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import {
  CButton,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CAlert,
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
} from "@coreui/react";
import { cilDescription, cilBuilding } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

const DepartmentUpdate = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState({ name: "", description: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await axiosInstance.get(
          `api/users/department-update/${id}/`
        );
        setDepartment(response.data);
      } catch (err) {
        console.error("Error fetching department:", err);
        setError("Failed to fetch department details.");
      }
    };

    fetchDepartment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    if (!department.name.trim() || !department.description.trim()) {
      setError("Role Name and Department are required fields.");
      setValidated(true);
      return;
    }
    try {
      const response = await axiosInstance.put(
        `api/users/department-update/${id}/`,
        department,
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(response.data.message || "Department updated successfully!");
      setError("");
    } catch (err) {
      console.error("Error updating department:", err.response?.data || err.message);
      setError("Failed to update department.");
    }
  };

  return (
    <CContainer
      fluid
      className="p-0"
      style={{ backgroundColor: "#f0f8ff", minHeight: "80vh" }}
    >
      <CCard className="m-3 mx-auto shadow" style={{ maxWidth: "550px" }}>
        <CCardHeader className="text-center bg-info text-black">
          <h4>Update Department</h4>
        </CCardHeader>
        <CCardBody>
          {message && <CAlert color="success">{message}</CAlert>}
          {error && <CAlert color="danger">{error}</CAlert>}
          <CForm onSubmit={handleSubmit} noValidate validated={validated}>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilBuilding} />
              </CInputGroupText>
              <CFormInput
                value={department.name}
                onChange={(e) => setDepartment({ ...department, name: e.target.value })}
                required
                placeholder="Department Name"
                invalid={validated && !department.name.trim()}
                feedback="Please provide a valid department."
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilDescription} />
              </CInputGroupText>
              <CFormInput
                value={department.description}
                onChange={(e) =>
                  setDepartment({ ...department, description: e.target.value })
                }
                placeholder="Description"
                invalid={validated && !department.description.trim()}
                feedback="Please provide a valid description."
              />
            </CInputGroup>

            <CButton type="submit" color="info" className="w-100">
              Update Department
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default DepartmentUpdate;
