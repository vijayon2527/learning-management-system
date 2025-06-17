import React, { useEffect, useState } from "react";
import { CContainer, CAlert, CSpinner } from "@coreui/react";
import axiosInstance from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";

const RoleDetail = ({ role }) => {
  const { id } = useParams();
  const [newRole, setNewRole] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axiosInstance.get(`/api/users/role-detail/${role.id}/`);
        if (response.data) {
          setNewRole(response.data);
        } else {
          setError("No role found.");
        }
      } catch (err) {
        console.error("Error fetching role details:", err);
        setError("Failed to fetch role details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [id]);

  return (
    <CContainer>
      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          Loading role details...
        </div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        newRole ? (
          <div>
            <h6>Name: {newRole.name || "No name available"}</h6>
            <p>Description: {newRole.description || "No description available"}</p>
            <p>Department: {newRole.department ? newRole.department.name : "No department assigned"}</p>

            {/* Scrollable Permissions Box */}
            <p><strong>Permissions:</strong></p>
            <div style={{
              maxHeight: "100px", // Adjust height as needed
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "5px",
              background: "#f9f9f9"
            }}>
              {newRole.permissions && newRole.permissions.length > 0 ? (
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {newRole.permissions.map((perm) => (
                    <li key={perm.id}>{perm.name} ({perm.codename})</li>
                  ))}
                </ul>
              ) : (
                <p>No permissions assigned.</p>
              )}
            </div>
          </div>
        ) : (
          <CAlert color="warning">No role data to display.</CAlert>
        )
      )}
    </CContainer>
  );
};

export default RoleDetail;
