import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import StudentLayout from './StudentLayout';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[\W_]/.test(password),
  };

  useEffect(() => {
    axiosInstance
      .get('/users/profile/')
      .then((res) => setFormData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!password) errs.password = 'This field is required.';
    if (!confirmPassword) errs.confirmPassword = 'This field is required.';
    if (password && confirmPassword && password !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    if (password && !Object.values(requirements).every(Boolean))
      errs.password = 'Password does not meet the requirements.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await axiosInstance.post('/api/users/set-password/', { password });
      toast.success('✅ Password changed successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('❌ Failed to change password. Please try again.');
    }
  };

  const RequirementItem = ({ label, isValid }) => (
    <li
      style={{
        color: isValid ? 'green' : '#666',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        marginBottom: '4px',
      }}
    >
      {isValid ? <FaCheckCircle color="green" size={14} /> : <FaTimesCircle color="gray" size={14} />}
      {label}
    </li>
  );

  return (
    <StudentLayout formData={formData}>
      <div style={{ maxWidth: '400px'}}>
        <h2 style={{ marginBottom: '10px' }}>Change Password</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* New Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              placeholder="Enter new password"
            />
            {errors.password && <p style={{ color: 'red', marginTop: '6px' }}>{errors.password}</p>}

            <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
              <RequirementItem label="At least 8 characters" isValid={requirements.length} />
              <RequirementItem label="At least one uppercase letter" isValid={requirements.upper} />
              <RequirementItem label="At least one lowercase letter" isValid={requirements.lower} />
              <RequirementItem label="At least one digit" isValid={requirements.digit} />
              <RequirementItem label="At least one special character" isValid={requirements.special} />
            </ul>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
              placeholder="Re-enter new password"
            />
            {errors.confirmPassword && (
              <p style={{ color: 'red', marginTop: '6px' }}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              padding: '12px 25px',
              backgroundColor: '#199fcc',
              color: '#fff',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Update Password
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </StudentLayout>
  );
};

export default ChangePassword;
