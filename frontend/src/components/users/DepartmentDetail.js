import React, { useEffect, useState } from "react";
import { CContainer, CAlert, CSpinner } from "@coreui/react";
import axiosInstance from "../../utils/axiosInstance";

const DepartmentDetail = ({ departmentId }) => {
  const [department, setDepartment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await axiosInstance.get(
          `api/users/department-detail/${departmentId}/`
        );
        setDepartment(response.data);
      } catch (err) {
        console.error("Error fetching department details:", err);
        setError("Failed to fetch department details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [departmentId]);

  return (
    <CContainer>
      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          Loading department details...
        </div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        department && (
          <div>
            <h6>Name: {department.name}</h6>
            <p>
              Description: {department.description || "No description available"}
            </p>
          </div>
        )
      )}
    </CContainer>
  );
};

export default DepartmentDetail;
