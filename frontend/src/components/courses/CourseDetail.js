import React, { useEffect, useState } from "react";
import { CContainer, CAlert, CSpinner } from "@coreui/react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const RoleDetail = ({material}) => {
  const { id } = useParams();
  const [newMaterial, setNewMaterial] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/material/materials/${material.id}/`  // Ensure leading slash
        );
        if (response.data) {
          setNewMaterial(response.data);
        } else {
          setError("No material found.");
        }
      } catch (err) {
        console.error("Error fetching material details:", err);
        setError("Failed to fetch material details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  return (
    <CContainer>
      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          Loading material details...
        </div>
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        newMaterial ? (
          <div>
            <h6>Name: {newMaterial.material .name || "No name available"}</h6>
            <p>
              <strong>Description:</strong> {newMaterial.material.description || "No description available"}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {newMaterial.category ? newMaterial.material.category_detail?.name : "No category assigned"}
            </p>
            <p>
              <strong>Stock Quantity:</strong> {newMaterial.material.stock_quantity || "No stock quantity available"}
            </p>
            <p>
              <strong>Unit Price:</strong> {newMaterial.material.unit_price || "No unit price available"}
            </p>
            <p>
              <strong>Unit of Measure:</strong> {newMaterial.material.unit_of_measure || "No unit of measure available"}
            </p>
            <p>
              <strong>Material Request Id:</strong> {newMaterial.material.sku || "No sku available"}
            </p>
            <p>
              <strong>Brand:</strong> {newMaterial.material.brand || "No Brand available"}
            </p>
            <p>
              <strong>Weight:</strong> {newMaterial.material.weight || "No Weight available"}
            </p>
            <p>
              <strong>Warranty Period:</strong> {newMaterial.material.warrenty_period || "No Warranty Period available"}
            </p>
            <p>
              <strong>Manufacturing Date:</strong> {newMaterial.material.manufacturing_date || "No Manufacturing Date available"}
            </p>
            <p>
              <strong>Expiry Date:</strong> {newMaterial.material.expiry_date || "No Expiry Date available"}
            </p>
            <p>
              <strong>Flammable:</strong> {newMaterial.material.flammable || "No Flammable available"}
            </p>
            <p>
              <strong>Recyclable:</strong> {newMaterial.material.recyclable !== undefined ? (newMaterial.material.recyclable ? "true" : "false") : "No recyclable information available"}
            </p>
            <p>
              <strong>Hazardous:</strong> {newMaterial.material.hazardous || "No Hazardous available"}
            </p>
          </div>
        ) : (
          <CAlert color="warning">No material data to display.</CAlert>
        )
      )}
    </CContainer>
  );
};

export default RoleDetail;
