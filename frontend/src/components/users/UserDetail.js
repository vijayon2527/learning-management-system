import React, { useState, useEffect } from "react";
import { CContainer, CAlert, CSpinner } from "@coreui/react";
import axiosInstance from "../../utils/axiosInstance";

const UserDetail = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user details based on the userId
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await axiosInstance.get(`api/users/detail/${userId}/`);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  return (
    <CContainer>
      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          Loading user details...
        </div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        user && (
            <>
              <p>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Department:</strong> {user.department ? user.department.name : "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {user.role ? user.role.name : "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}
              </p>
            </>
        )
      )}
    </CContainer>
  );
};

export default UserDetail;
