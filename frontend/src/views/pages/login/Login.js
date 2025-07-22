import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm,
  CFormInput, CFormSelect, CInputGroup, CInputGroupText, CRow, CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import AuthContext from '../../../components/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../../utils/axiosInstance';
import OTPInput from 'react-otp-input';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleOtpSubmit = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/users/verify-otp/', {
        email: formData.email,
        otp,
      });

      if (res.status === 200) {
      await loginUser(formData);
    }
    } catch (err) {
      setErrors({ general: 'Invalid OTP.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/users/send-otp/', {
        email: formData.email,
        password: formData.password,
      });

      setOtpSent(true);

      if (res.data.otp) {
        setTimeout(() => {
          setOtp(res.data.otp); // triggers OTP auto-submit via useEffect
        }, 2000);
      }
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'OTP send failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto submit OTP
  useEffect(() => {
    if (otp.length === 6) {
      handleOtpSubmit();
    }
  }, [otp]);

  // GitHub code exchange and Facebook SDK init
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    const handleGitHubExchange = async (code) => {
      try {
        await loginUser({ provider: 'github', code });
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/dashboard');
      } catch (error) {
        console.error('GitHub login failed:', error);
        setErrors({ general: 'GitHub login failed.' });
      }
    };

    if (code) handleGitHubExchange(code);
    loadFacebookSDK();
  }, [loginUser, navigate]);

  const loadFacebookSDK = () => {
    if (window.FB) return;
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleFacebookLogin = () => {
    if (!window.FB) return setErrors({ general: 'Facebook SDK not loaded.' });
    window.FB.login(
      (res) => {
        if (res.authResponse) {
          loginUser({ provider: 'facebook', access_token: res.authResponse.accessToken })
            .then(() => navigate('/dashboard'))
            .catch(() => setErrors({ general: 'Facebook login failed.' }));
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  const handleGoogleLoginSuccess = async ({ credential }) => {
    try {
      await loginUser({ provider: 'google', access_token: credential });
      navigate('/dashboard');
    } catch {
      setErrors({ general: 'Google login failed.' });
    }
  };

  const handleGitHubLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    if (!clientId) return console.error('Missing GitHub client ID');
    const redirectUri = window.location.origin;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email`;
  };

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <CRow>
        <CCol md={12}>
          <CCard className="p-4 shadow-sm rounded-4">
            <CCardBody>
              <h1 className="text-center mb-4">Login</h1>
              <CForm onSubmit={otpSent ? (e) => e.preventDefault() : handleSubmit}>
                <div className="mb-3">
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormInput
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'is-invalid' : ''}
                    disabled={otpSent}
                  />
                </CInputGroup>
                {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </div>

                <div className="mb-3">
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'is-invalid' : ''}
                    disabled={otpSent}
                  />
                </CInputGroup>
                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                </div>

                {otpSent && (
                  <div className="mb-4 text-center">
                    <h5>🔐 Enter the 6-digit OTP</h5>
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      inputStyle={{
                        width: '2.5rem',
                        height: '2.5rem',
                        margin: '0 0.3rem',
                        fontSize: '1.2rem',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                      renderInput={(props) => <input {...props} />}
                    />
                    {errors.general && <div className="text-danger mt-2">{errors.general}</div>}

                    <div className="mt-2">
                      <small>Didn't receive the code?</small>{' '}
                      <button
                        className="btn btn-link p-0"
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                {errors.general && !otpSent && (
                  <div className="text-danger mb-2">{errors.general}</div>
                )}

                <CButton
                  type="submit"
                  color="primary"
                  className="w-100 mb-3"
                  disabled={loading || (otpSent && otp.length < 6)}
                >
                  {loading ? <CSpinner size="sm" /> : otpSent ? 'Verifying OTP...' : 'Login'}
                </CButton>
              </CForm>

              <div className="text-center my-3">
                <strong className="text-muted">— Continue with a Social Account —</strong>
              </div>

              <div className="d-grid gap-2">
                <div className="mb-2">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => console.log('Google login failed')}
                    useOneTap
                    shape="pill"
                    width="100%"
                  />
                </div>

                <CButton
                  color="primary"
                  className="d-flex align-items-center justify-content-center gap-2"
                  onClick={handleFacebookLogin}
                >
                  <i className="bi bi-facebook fs-5"></i>
                  Continue with Facebook
                </CButton>

                <CButton
                  color="dark"
                  className="d-flex align-items-center justify-content-center gap-2"
                  onClick={handleGitHubLogin}
                >
                  <i className="bi bi-github fs-5"></i>
                  Continue with GitHub
                </CButton>
              </div>

              <div className="text-center mt-4">
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
