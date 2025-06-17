import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm,
  CFormInput, CFormSelect, CInputGroup, CInputGroupText, CRow, CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import AuthContext from '../../../components/context/AuthContext';
import axiosInstance from '../../../utils/axiosInstance';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await loginUser(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setErrors({ general: err.response?.data?.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
    <CRow>
      <CCol md={12}>
        <CCard className="p-4">
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <h1 className="text-center mb-4">Login</h1>
              
              <CInputGroup className="mb-3">
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'is-invalid' : ''}
                />
              </CInputGroup>
              {errors.email && <div className="text-danger">{errors.email}</div>}
  
              <CInputGroup className="mb-3">
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'is-invalid' : ''}
                />
              </CInputGroup>
              {errors.password && <div className="text-danger">{errors.password}</div>}
  
              <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Login'}
              </CButton>
            </CForm>
  
            <div className="text-center mt-3">
              <Link to="/forgot-password">Forgot Password?</Link>
              <span className="mx-2">|</span>
              <Link to="/register">Register</Link>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
  );
};

export default Login;
