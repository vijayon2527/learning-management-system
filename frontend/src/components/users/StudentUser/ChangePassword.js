// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../utils/axiosInstance';
// import StudentLayout from './StudentLayout';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';


// const ChangePassword = () => {
//   const [formData, setFormData] = useState({});
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [errors, setErrors] = useState({});

//   const requirements = {
//     length: password.length >= 8,
//     upper: /[A-Z]/.test(password),
//     lower: /[a-z]/.test(password),
//     digit: /\d/.test(password),
//     special: /[\W_]/.test(password),
//   };

//   useEffect(() => {
//     axiosInstance.get('/users/profile/')
//       .then((res) => setFormData(res.data))
//       .catch((err) => console.error(err));
//   }, []);

//   const validateForm = () => {
//     const errs = {};
//     if (!password) errs.password = 'This field is required.';
//     if (!confirmPassword) errs.confirmPassword = 'This field is required.';
//     if (password && confirmPassword && password !== confirmPassword)
//       errs.confirmPassword = 'Passwords do not match.';
//     if (password && !Object.values(requirements).every(Boolean))
//       errs.password = 'Password does not meet the requirements.';
//     return errs;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     const validationErrors = validateForm();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length > 0) return;

//     try {
//       await axiosInstance.post('/api/users/set-password/', { password });
//       toast.success('✅ Password changed successfully!');
//       setPassword('');
//       setConfirmPassword('');
//     } catch (error) {
//       toast.error('❌ Failed to change password. Please try again.');
//     }
//   };
  

//  const RequirementItem = ({ label, isValid }) => (
//   <li style={{ color: isValid ? 'green' : 'black', display: 'flex', alignItems: 'center', gap: '8px' }}>
//     {isValid ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />}
//     {label}
//   </li>
// );

//   return (
//     <StudentLayout formData={formData}>
//       <h2>Change Password</h2>
//       <p>Here you can change your password.</p>
//       <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
//         <div style={{ marginBottom: '1rem' }}>
//           <label>New Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={{ width: '100%', padding: '8px' }}
//           />
//           {errors.password && <p style={{ color: 'red', marginTop: 4 }}>{errors.password}</p>}

//           {/* Password Rules */}
//           <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
//             <RequirementItem label="At least 8 characters" isValid={requirements.length} />
//             <RequirementItem label="At least one uppercase letter" isValid={requirements.upper} />
//             <RequirementItem label="At least one lowercase letter" isValid={requirements.lower} />
//             <RequirementItem label="At least one digit" isValid={requirements.digit} />
//             <RequirementItem label="At least one special character" isValid={requirements.special} />
//           </ul>
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label>Confirm Password</label>
//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             style={{ width: '100%', padding: '8px' }}
//           />
//           {errors.confirmPassword && <p style={{ color: 'red', marginTop: 4 }}>{errors.confirmPassword}</p>}
//         </div>

//         <button type="submit" style={{ padding: '10px 20px' }}>Update Password</button>
//       </form>
//       <ToastContainer />
//     </StudentLayout>
//   );
// };

// export default ChangePassword;




import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import StudentLayout from './StudentLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const requirements = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[\W_]/.test(password),
  };

  useEffect(() => {
    axiosInstance.get('/users/profile/')
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
    setMessage('');
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
    <li style={{ color: isValid ? 'green' : 'black' }}>
      {isValid ? '✔️' : ''} {label}
    </li>
  );

  return (
    <StudentLayout formData={formData}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.password && <p style={{ color: 'red', marginTop: 4 }}>{errors.password}</p>}

          {/* Password Rules */}
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            <RequirementItem label="At least 8 characters" isValid={requirements.length} />
            <RequirementItem label="At least one uppercase letter" isValid={requirements.upper} />
            <RequirementItem label="At least one lowercase letter" isValid={requirements.lower} />
            <RequirementItem label="At least one digit" isValid={requirements.digit} />
            <RequirementItem label="At least one special character" isValid={requirements.special} />
          </ul>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.confirmPassword && <p style={{ color: 'red', marginTop: 4 }}>{errors.confirmPassword}</p>}
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>Update Password</button>
      </form>
      <ToastContainer />
    </StudentLayout>
  );
};

export default ChangePassword;
