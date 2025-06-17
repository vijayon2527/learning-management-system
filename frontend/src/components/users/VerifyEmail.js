import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CCard, CCardBody, CCardGroup, CContainer, CAlert } from "@coreui/react";
import axiosInstance from "../../utils/axiosInstance";

const VerifyEmail = () => {
  const { token } = useParams(); 
  const navigate = useNavigate(); 
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(true); 
  const [flashMessage, setFlashMessage] = useState(""); 

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axiosInstance.get(`api/users/verify-email/${token}/`);
        setMessage(response.data.message);
        if (response.data.message.includes("successfully")) {
          setFlashMessage("Your email is verified successfully. You can log in now.");
          setTimeout(() => navigate("/login"), 4000); 
        }
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
  }, [token, navigate]);

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
                {flashMessage && (
                  <CAlert color="success">
                    {flashMessage}
                  </CAlert>
                )}
                <p>{message}</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCardGroup>
    </CContainer>
  );
};

export default VerifyEmail;
