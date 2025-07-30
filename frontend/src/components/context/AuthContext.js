import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';
import dayjs from 'dayjs';

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Utility: Retrieve stored tokens
  const getStoredTokens = () => {
    const storedTokens = localStorage.getItem('authTokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  };

  // States
  const [authTokens, setAuthTokens] = useState(getStoredTokens());
  const [user, setUser] = useState(() => {
    const tokens = getStoredTokens();
    if (tokens) {
      const decoded = jwtDecode(tokens.access);
      return { ...decoded, role: tokens.role || "" };
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Utility: Show notifications
  const notify = (msg, type = 'success') => {
    type === 'error' ? toast.error(msg) : toast.success(msg);
  };

  // Login
 const loginUser = async (credentials) => {
    try {
      const response = await axiosInstance.post('api/users/token/', credentials)
      const { access, refresh, role } = response.data
      const decodedUser = jwtDecode(access)
      const userType = decodedUser.user_type || ''
      const userRole = role || ''

      const updatedUser = { ...decodedUser, role: userRole }

      setAuthTokens({ access, refresh, role })
      setUser(updatedUser)
      localStorage.setItem('authTokens', JSON.stringify({ access, refresh, role }))

      notify('Logged in successfully.')

    // ✅ Role-based redirection
    if (userType === "STUDENT") {
      window.dispatchEvent(new Event('close-login'));
    } else if (userType === "PLATFORM" && userRole === "SUPER_ADMIN") {
      navigate('/dashboard'); // super admin
    } 
      // 🚀 FIX: Redirect student back to payment page if trackId is present
      let redirectTo = '/'
      let trackId = null

      // Read redirect info stored in sessionStorage
      const redirectDataRaw = sessionStorage.getItem('redirectAfterLogin')
      if (redirectDataRaw) {
        try {
          const redirectData = JSON.parse(redirectDataRaw)
          redirectTo = redirectData.from || '/'
          trackId = redirectData.trackId || null
        } catch {
          // ignore JSON parse errors
        }
        sessionStorage.removeItem('redirectAfterLogin')
      }

      if (userType === 'STUDENT') {
        navigate(redirectTo, {
          state: { trackId },
          replace: true,
        })
      } else if (userType === 'PLATFORM' && userRole === 'SUPER_ADMIN') {
        navigate('/dashboard')
      } else {
        // fallback for other users
        navigate('/')
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Login failed. Please try again.'
      notify(errorMsg, 'error')
    }
  }

  
  // Logout
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    notify('Logged out successfully.');
    navigate('/');
  };

  // Refresh Token
  const refreshToken = async () => {
    try {
      const response = await axiosInstance.post('/api/users/token/refresh/', {
        refresh: authTokens.refresh,
      });
      const { access, role } = response.data;
      const decodedUser = jwtDecode(access);

      setAuthTokens((prev) => ({ ...prev, access, role: role || "" }));
      setUser({ ...decodedUser, role: role || [] });
      localStorage.setItem(
        'authTokens',
        JSON.stringify({ ...authTokens, access, role: role || "" })
      );
    } catch (error) {
      console.error('Token refresh failed:', error);
      logoutUser();
    }
  };

  // Token Refresh Logic
  useEffect(() => {
    if (!authTokens) {
      setLoading(false);
      return;
    }

    const scheduleRefresh = () => {
      const decoded = jwtDecode(authTokens.access);
      const tokenExpirationTime = dayjs.unix(decoded.exp);
      const timeUntilExpiration = tokenExpirationTime.diff(dayjs(), 'milliseconds');

      if (timeUntilExpiration > 0) {
        return setTimeout(refreshToken, timeUntilExpiration - 60 * 1000); // Refresh 1 min before expiration
      }

      refreshToken();
    };

    const refreshTimeout = scheduleRefresh();
    setLoading(false);

    return () => clearTimeout(refreshTimeout);
  }, [authTokens]);

  // Sync with Local Storage Changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'authTokens') {
        const newTokens = event.newValue ? JSON.parse(event.newValue) : null;
        setAuthTokens(newTokens);

        if (newTokens) {
          const decodedUser = jwtDecode(newTokens.access);
          setUser({ ...decodedUser, role: newTokens.role || "" });
        } else {
          setUser(null);
          notify('Session ended. Please log in again.', 'error');
          navigate('/');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Context Data
  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
