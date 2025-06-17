import { useState, useEffect } from 'react';
import {
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormLabel,
  CRow,
  CCol,
  CFormCheck,
  CFormTextarea,
  CSpinner,
  CFormFeedback,
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';

const notify = (message) => toast(message);

const CreateCourseCategory = ({ onMaterialCreated, onClose }) => {
  const [material, setMaterial] = useState({
    name: '',
    description: '',
    category: '',
    stock_quantity: '',
    sku: '',
    unit_price: '',
    unit_of_measure: '',
    brand: '',
    weight: '',
    hazardous: false,
    flammable: false,
    recyclable: true,
    manufacturing_date: null,
    expiry_date: null,
    warranty_period: null,
  });

  const [categories, setCategory] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValidated, setIsFormValidated] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('api/material/categories/');
        setCategory(response.data);
      } catch (err) {
        setError('Failed to fetch categories.');
      }
    };
    fetchCategories();
  }, []);

  const isInteger = (value) => /^\d+$/.test(value);

  const validateFields = () => {
    const errors = {};

    if (!material.name.trim()) errors.name = 'Name is required.';
    if (!material.category.trim()) errors.category = 'Category is required.';
    if (!material.sku.trim()) errors.sku = 'SKU is required.';
    if (!material.stock_quantity.trim() || !isInteger(material.stock_quantity)) {
      errors.stock_quantity = 'A valid integer is required for stock quantity.';
    }
    if (!material.unit_price.trim() || !isInteger(material.unit_price)) {
      errors.unit_price = 'A valid integer is required for unit price.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (form.checkValidity() === false || !validateFields()) {
      e.stopPropagation();
      setIsFormValidated(true); // Fix: Set it to true after checking validity
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('api/material/materials/', material);
      setError('');
      notify('Material created successfully!');
      onMaterialCreated(response.data);
      onClose();
      setMaterial({
        name: '',
        description: '',
        category: '',
        stock_quantity: '',
        sku: '',
        unit_price: '',
        unit_of_measure: '',
        brand: '',
        weight: '',
        hazardous: false,
        flammable: false,
        recyclable: true,
        manufacturing_date: null,
        expiry_date: null,
        warranty_period: null,
      });
      setIsFormValidated(true);
      setFieldErrors({});
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = typeof errorData === 'object' ? Object.values(errorData).flat().join(', ') : 'Failed to create material.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CContainer>
            <CForm onSubmit={handleSubmit} noValidate validated={isFormValidated}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                Material Category <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
                </CFormLabel>
                <CFormSelect
                  value={material.category}
                  onChange={(e) => setMaterial({ ...material, category: e.target.value })}
                  invalid={isFormValidated && !material.category.trim()}
                  feedback="please select a valid category"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>{fieldErrors.category}</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                Material Name <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Material Name"
                  value={material.name}
                  onChange={(e) => setMaterial({ ...material, name: e.target.value })}
                  invalid={isFormValidated && !material.name.trim()}
                  feedback="please enter a valid name"
                  required
                />
                <CFormFeedback invalid>{fieldErrors.name}</CFormFeedback>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Material Description</CFormLabel>
                <CFormTextarea
                  placeholder="Enter a description"
                  value={material.description}
                  onChange={(e) => setMaterial({ ...material, description: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Material Request Id(MRI) <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Material Request Id"
                  value={material.sku}
                  onChange={(e) => setMaterial({ ...material, sku: e.target.value })}
                  invalid={isFormValidated && !material.sku.trim()}
                  feedback="please enter a valid Material Request Id"
                  required
                />
                <CFormFeedback invalid>{fieldErrors.sku}</CFormFeedback>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                Stock Quantity <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Stock Quantity"
                  value={material.stock_quantity}
                  onChange={(e) => setMaterial({ ...material, stock_quantity: e.target.value })}
                  invalid={isFormValidated && !material.stock_quantity.trim()}
                  feedback="please enter a valid stock quantity"
                  required
                />
                <CFormFeedback invalid>{fieldErrors.stock_quantity}</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                Unit Price <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Unit Price"
                  value={material.unit_price}
                  onChange={(e) => setMaterial({ ...material, unit_price: e.target.value })}
                  invalid={isFormValidated && !material.unit_price.trim()}
                  feedback="please eneter a valid unit price"
                  required
                />
                <CFormFeedback invalid>{fieldErrors.unit_price}</CFormFeedback>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                Unit of Measure(UOM) <span style={{ color: "red", fontSize: "1.5rem" }}>*</span>
                </CFormLabel>
                <CFormInput
                  placeholder="Unit of Measure"
                  value={material.unit_of_measure}
                  onChange={(e) => setMaterial({ ...material, unit_of_measure: e.target.value })}
                  invalid={isFormValidated && !material.unit_of_measure.trim()}
                  feedback="please enter a valid unit of measure"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Brand</CFormLabel>
                <CFormInput
                  placeholder="Brand"
                  value={material.brand}
                  onChange={(e) => setMaterial({ ...material, brand: e.target.value })}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Weight</CFormLabel>
                <CFormInput
                  placeholder="Weight"
                  value={material.weight}
                  onChange={(e) => setMaterial({ ...material, weight: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Warranty Period</CFormLabel>
                <CFormInput
                  placeholder="Warranty Period"
                  value={material.warranty_period || ''}
                  onChange={(e) => setMaterial({ ...material, warranty_period: e.target.value })}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Manufacturing Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={material.manufacturing_date || ''}
                  onChange={(e) => setMaterial({ ...material, manufacturing_date: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Expiry Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={material.expiry_date || ''}
                  onChange={(e) => setMaterial({ ...material, expiry_date: e.target.value })}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormCheck
                  id="flammableCheck"
                  label="Flammable"
                  checked={material.flammable}
                  onChange={(e) => setMaterial({ ...material, flammable: e.target.checked })}
                />
              </CCol>
              <CCol md={4}>
                <CFormCheck
                  id="recyclableCheck"
                  label="Recyclable"
                  checked={material.recyclable}
                  onChange={(e) => setMaterial({ ...material, recyclable: e.target.checked })}
                />
              </CCol>
              <CCol md={4}>
                <CFormCheck
                  id="hazardousCheck"
                  label="Hazardous"
                  checked={material.hazardous}
                  onChange={(e) => setMaterial({ ...material, hazardous: e.target.checked })}
                />
              </CCol>
            </CRow>

            <CButton type="submit" color="info" className="w-100" disabled={isLoading}>
              {isLoading ? <CSpinner size="sm" /> : 'Create Material'}
            </CButton>
          </CForm>
    </CContainer>
  );
};

export default CreateCourseCategory;



