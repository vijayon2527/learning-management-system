import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CButton,
  CTooltip,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilArrowLeft } from "@coreui/icons";
import axiosInstance from "../../../utils/axiosInstance";

const stripHtmlTags = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axiosInstance.get(`/api/courses/categories/${id}/`);
        setCategory(res.data);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Could not load category.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <CSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-center p-4">
        {error}
        <div className="mt-3">
          <CButton color="secondary" onClick={() => navigate(-1)}>
            Back
          </CButton>
        </div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-1">
        <h2 className="mb-1">Category Details</h2>
        <CTooltip content="Go back">
          <CButton
            color="light"
            className="text-dark border border-secondary"
            onClick={() => navigate("/dashboard/course-category-list")}
            style={{
              fontWeight: 600,
              borderRadius: "2rem",
              padding: "0.45rem 1.2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <CIcon icon={cilArrowLeft} className="me-2" />
            Back
          </CButton>
        </CTooltip>
      </div>

      {/* Category Info Card */}
      <CCard className="mb-4">
        <CCardBody className="p-3">
          <CRow className="align-items-center g-4">
            <CCol md={4} className="d-flex flex-column align-items-center">
              <CTooltip content="Category logo">
                {category.logo ? (
                  <img
                    src={category.logo}
                    alt="Logo"
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.15), 0 0 0 4px #fff",
                      border: "2px solid #ddd",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      border: "2px dashed #bbb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa",
                      fontStyle: "italic",
                      backgroundColor: "#f8f8f8",
                    }}
                  >
                    {category.name?.split(" ").slice(0, 3).join(" ") || "Category"}
                  </div>
                )}
              </CTooltip>
            </CCol>

            <CCol md={8}>
              <h1
                className="mb-4"
                style={{
                  fontWeight: 700,
                  color: "#2c3e50",
                  borderBottom: "3px solid #0d6efd",
                  paddingBottom: 6,
                  letterSpacing: 1,
                }}
              >
                {category.name}
              </h1>

              <CRow className="g-3">
                <CCol sm={6}>
                  <div className="p-3 border rounded bg-light">
                    <strong>📁 Category</strong>
                    <p className="mb-0 text-muted">{category.name}</p>
                  </div>
                </CCol>
                <CCol sm={6}>
                  <div className="p-3 border rounded bg-light">
                    <strong>🗂️ Parent Category</strong>
                    <p className="mb-0 text-muted">{category.parent_name || "-"}</p>
                  </div>
                </CCol>
                <CCol sm={6}>
                  <div className="p-3 border rounded bg-light">
                    <strong>⚙️ Status</strong>
                    <p
                      className="mb-0"
                      style={{
                        color: category.is_active ? "#198754" : "#6c757d",
                        fontWeight: 600,
                      }}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </CCol>
                <CCol sm={6}>
                  <div className="p-3 border rounded bg-light">
                    <strong>📅 Created At</strong>
                    <p className="mb-0 text-muted">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </CCol>
              </CRow>

              <div className="mt-4 p-3 border rounded bg-light">
                <strong>📝 Description</strong>
                <p
                  className="mb-0"
                  style={{ color: "#555", whiteSpace: "pre-wrap" }}
                >
                  {stripHtmlTags(category.description)}
                </p>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default CategoryDetail;
