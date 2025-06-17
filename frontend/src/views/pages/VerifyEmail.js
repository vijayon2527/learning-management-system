import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CButton, CCard, CCardBody, CCardGroup, CContainer } from "@coreui/react";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams(); 
  const navigate = useNavigate(); 
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/verify-email/${token}/');
        setMessage(response.data.message || "Email verified successfully.");
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.detail || "Invalid or expired token.");
        } else {
          setMessage("An error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyEmail();
  }, [token]);

  const handleRedirect = () => {
    navigate("/login"); 
  };

  return (
    <CContainer className="verify-email-container">
      <CCardGroup className="mt-5">
        <CCard>
          <CCardBody>
            <h3>Email Verification</h3>
            {loading ? (
              <p>Verifying your email...</p>
            ) : (
              <div>
                <p>{message}</p>
                {message.includes("successfully") && (
                  <CButton color="primary" onClick={handleRedirect}>
                    Go to Login
                  </CButton>
                )}
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCardGroup>
    </CContainer>
  );
};

export default VerifyEmail;