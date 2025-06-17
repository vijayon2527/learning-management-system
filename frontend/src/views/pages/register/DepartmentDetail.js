import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CCard, CCardBody, CCardHeader, CContainer, CAlert } from "@coreui/react";
import axiosInstance from "../../../utils/axiosInstance";
const DepartmentDetail = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await axiosInstance.get(
          `api/users/department-detail/${id}/`
        );
        setDepartment(response.data);
      } catch (err) {
        console.error("Error fetching department details:", err);
        setError("Failed to fetch department details.");
      }
    };

    fetchDepartment();
  }, [id]);

  return (
    <CContainer className="pt-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {error ? (
        <CAlert color="danger" className="w-50 mx-auto text-center">
          {error}
        </CAlert>
      ) : (
        department && (
          <CCard className="mx-auto" style={{ width: "30rem", backgroundColor: "#f9f9f9" }}>
            <CCardHeader style={{ backgroundColor: "#007bff", color: "black" }}>
              <h3>Department Details</h3>
            </CCardHeader>
            <CCardBody style={{ backgroundColor: "#f1f1f1" }}>
              <h4 style={{ color: "#333" }}>Name: {department.name}</h4>
              <p style={{ color: "#555" }}>
                Description: {department.description || "No description available"}
              </p>
            </CCardBody>
          </CCard>
        )
      )}
    </CContainer>
  );
};

export default DepartmentDetail;