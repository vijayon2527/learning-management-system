import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CButton,
} from "@coreui/react";
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

  if (!category) {
    return null;
  }

  return (
    <CCard
      className="mx-auto my-4 shadow-sm"
      style={{ maxWidth: 900, borderRadius: "12px" }}
    >
      <CCardBody>
        <CRow className="align-items-center g-4">
          {/* Left: Circular Logo */}
          <CCol
            md={4}
            className="d-flex justify-content-center"
            style={{ flexDirection: "column", alignItems: "center" }}
          >
            {category.logo ? (
              <img
                src={category.logo}
                alt="Category Logo"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.15), 0 0 0 4px #fff",
                  border: "2px solid #ddd",
                  backgroundColor: "#fff",
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
                No Logo
              </div>
            )}
          </CCol>

          {/* Right: Details */}
          <CCol md={8}>
            <h1
              className="mb-4"
              style={{
                fontWeight: "700",
                color: "#2c3e50",
                borderBottom: "3px solid #0d6efd",
                paddingBottom: 6,
                letterSpacing: 1,
              }}
            >
              {category.name}
            </h1>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "600", color: "#34495e" }}>
                Description
              </h5>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                }}
              >
                {stripHtmlTags(category.description)}
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "600", color: "#34495e" }}>
                Parent Category
              </h5>
              <p style={{ fontSize: 16, color: "#666" }}>
                {category.parent_name || "No Parent"}
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "600", color: "#34495e" }}>
                Created At
              </h5>
              <p style={{ fontSize: 16, color: "#666" }}>
                {category.created_at
                  ? new Date(category.created_at).toLocaleString()
                  : "-"}
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h5 style={{ fontWeight: "600", color: "#34495e" }}>
                Updated At
              </h5>
              <p style={{ fontSize: 16, color: "#666" }}>
                {category.updated_at
                  ? new Date(category.updated_at).toLocaleString()
                  : "-"}
              </p>
            </section>

            <div className="d-flex justify-content-end mt-4">
              <CButton
                color="secondary"
                onClick={() => navigate(-1)}
                style={{ fontWeight: "600", padding: "0.6rem 1.4rem" }}
              >
                Back
              </CButton>
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default CategoryDetail;
