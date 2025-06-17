import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CFormCheck,
  CFormLabel,
  CFormTextarea,
} from "@coreui/react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from 'react-toastify';

const notify = (message) => toast(message);

const CourseCategoryUpdate = ({ materialId, onClose }) => {
  const { id } = useParams();  // Use the id from URL params
  const [material, setMaterial] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [validated, setValidated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Fetch data only when materialId or id is available
    const fetchData = async () => {
      try {
        // Fetching material details based on the materialId prop or id from URL
        const materialResponse = await axiosInstance.get(`api/material/materials/${materialId || id}/`);
        const categoryResponse = await axiosInstance.get("api/material/categories/");

        if (materialResponse.data.material) {
          setMaterial(materialResponse.data.material);
        } else {
          setError("Material not found.");
        }

        if (categoryResponse.data) {
          setCategories(categoryResponse.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch material details.");
      }
    };

    fetchData();
  }, [materialId, id]); // Ensure to fetch when materialId or id changes

  const validateFields = () => {
    const errors = {};

    if (!material.stock_quantity || !/^\d+$/.test(material.stock_quantity)) {
      errors.stock_quantity = "A valid integer is required for stock quantity.";
    }
    if (!material.unit_price || isNaN(Number(material.unit_price))) {
      errors.unit_price = "A valid number is required for unit price.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false || !validateFields()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      // Send the correct category_detail with the request
      const updatedMaterial = {
        ...material,
        category_detail: {
          ...material.category_detail, 
          id: material.category_detail?.id // Make sure category detail is updated
        }
      };

      await axiosInstance.patch(`api/material/materials/${materialId || id}/`, updatedMaterial);
      setMessage("Material updated successfully!");
      setError("");
      setFieldErrors({}); // Clear field errors after success
      if (onClose) {
        onClose(); // Close the modal if onClose prop is passed
      }
      notify("Material updated successfully!"); // Display notification
    } catch (err) {
      console.error(err);
      setError("Failed to update material.");
      setMessage("");
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setMaterial((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "category_id") {
      // When category is changed, update the category_detail properly
      const selectedCategory = categories.find(category => category.id === value);
      setMaterial((prev) => ({
        ...prev,
        category_detail: { id: value, name: selectedCategory ? selectedCategory.name : "" },
      }));
    } else {
      setMaterial((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!material) {
    return <div>Loading...</div>;
  }

  return (
    <CContainer>
  <CForm onSubmit={handleSubmit} noValidate validated={validated}>
    {/* Category and Name - side by side */}
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel>
          Material Category <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
        </CFormLabel>
        <CFormSelect
          name="category_id"
          value={material.category_detail?.id || ""}
          onChange={handleChange}
          invalid={validated && !material.category_detail?.id}
          feedback="Please select a valid category"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </CFormSelect>
      </CCol>
      <CCol md={6}>
        <CFormLabel>
          Material Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
        </CFormLabel>
        <CFormInput
          name="name"
          value={material.name || ""}
          onChange={handleChange}
          invalid={validated && !material.name}
          feedback="Please enter a valid name"
          required
        />
      </CCol>
    </CRow>
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel>
          Description
        </CFormLabel>
        <CFormTextarea
          name="description"
          value={material.description || ""}
          onChange={handleChange}
          required
        />
      </CCol>
      <CCol md={6}>
        <CFormLabel>
          Stock Quantity <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
        </CFormLabel>
        <CFormInput
          name="stock_quantity"
          value={material.stock_quantity || ""}
          onChange={handleChange}
          invalid={validated && (fieldErrors.stock_quantity || !material.stock_quantity)}
          feedback="Please enter a valid stock quantity"
          required
        />
      </CCol>
    </CRow>
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel>
          Unit Price <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
        </CFormLabel>
        <CFormInput
          name="unit_price"
          value={material.unit_price || ""}
          onChange={handleChange}
          invalid={validated && (fieldErrors.unit_price || !material.unit_price)}
          feedback="Please enter a valid unit price"
          required
        />
      </CCol>
      <CCol md={6}>
        <CFormLabel>
          Unit Of Measure(UOM) <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
        </CFormLabel>
        <CFormInput
          name="unit_of_measure"
          value={material.unit_of_measure || ""}
          onChange={handleChange}
          invalid={validated && !material.unit_of_measure}
          feedback="Please enter a valid unit of measure"
          required
        />
      </CCol>
    </CRow>
      <CRow className="mb-3">
      <CCol md={6}>
        <CFormLabel>
          Material Requested Id <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
        </CFormLabel>
        <CFormInput
          name="sku"
          value={material.sku || ""}
          onChange={handleChange}
          invalid={validated && !material.sku}
          feedback="Please enter a valid Material Request Id"
          required
        />
      </CCol>
      <CCol md={6}>
        <CFormInput
          name="brand"
          label="Brand"
          value={material.brand || ""}
          onChange={handleChange}
        />
      </CCol>
    </CRow>

    {/* Weight and Manufacturing Date - side by side */}
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormInput
          name="weight"
          label="Weight"
          value={material.weight || ""}
          onChange={handleChange}
        />
      </CCol>
      <CCol md={6}>
        <CFormInput
          name="manufacturing_date"
          type="date"
          label="Manufacturing Date"
          value={material.manufacturing_date || ""}
          onChange={handleChange}
        />
      </CCol>
    </CRow>

    {/* Expiry Date and Warranty Period - side by side */}
    <CRow className="mb-3">
      <CCol md={6}>
        <CFormInput
          name="expiry_date"
          type="date"
          label="Expiry Date"
          value={material.expiry_date || ""}
          onChange={handleChange}
        />
      </CCol>
      <CCol md={6}>
        <CFormInput
          name="warranty_period"
          label="Warranty Period"
          value={material.warranty_period || ""}
          onChange={handleChange}
        />
      </CCol>
    </CRow>

    {/* Flammable, Recyclable, and Hazardous checkboxes - side by side */}
    <CRow className="mb-3">
      <CCol md={4}>
        <CFormCheck
          name="flammable"
          label="Flammable"
          checked={material.flammable || false}
          onChange={handleChange}
        />
      </CCol>
      <CCol md={4}>
        <CFormCheck
          name="recyclable"
          label="Recyclable"
          checked={material.recyclable || false}
          onChange={handleChange}
        />
      </CCol>
      <CCol md={4}>
        <CFormCheck
          name="hazardous"
          label="Hazardous"
          checked={material.hazardous || false}
          onChange={handleChange}
        />
      </CCol>
    </CRow>

    {/* Submit Button */}
    <CButton type="submit" color="info" className="mt-3 w-100">
      Update Material
    </CButton>
  </CForm>
</CContainer>
  );
};

export default CourseCategoryUpdate;
