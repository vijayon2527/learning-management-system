import React, { useState } from "react";
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CButton,
  CAlert,
  CInputGroup,
  CInputGroupText,
} from "@coreui/react";
import { cilBuilding, cilDescription } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import axiosInstance from "../../../utils/axiosInstance";

const CreateDepartment = () => {
  const [department, setDepartment] = useState({ name: "", description: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const response = await axiosInstance.post(
        "api/users/create-department/",
        department
      );
      setMessage(response.data.message);
      setError("");
      setDepartment({ name: "", description: "" });
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg =
        typeof errorData === "object"
          ? Object.values(errorData).flat().join(", ")
          : "Failed to create department.";
      setError(errorMsg);
    }
  };

  return (
    <CContainer className="d-flex justify-content-center align-items-center">
      <CCard style={{ width: "35rem", backgroundColor: "#f8f9fa" }}>
        <CCardHeader className="text-black bg-info">
          <h3>Create Department</h3>
        </CCardHeader>
        <CCardBody>
          {message && <CAlert color="success">{message}</CAlert>}
          {error && <CAlert color="danger">{error}</CAlert>}
          <CForm onSubmit={handleSubmit} noValidate validated={validated}>
            <div className="mb-3">
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Department Name"
                  value={department.name}
                  onChange={(e) =>
                    setDepartment({ ...department, name: e.target.value })
                  }
                  invalid={validated && !department.name.trim()}
                  required
                  feedback="Please provide a valid department name."
                />
              </CInputGroup>
            </div>
            <div className="mb-3">
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilDescription} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Description"
                  value={department.description}
                  onChange={(e) =>
                    setDepartment({ ...department, description: e.target.value })
                  }
                />
              </CInputGroup>
            </div>

            <CButton type="submit" color="info" className="w-100">
              Create Department
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default CreateDepartment;
