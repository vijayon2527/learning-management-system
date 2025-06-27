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
    const stored = localStorage.getItem('authTokens');
    return stored ? JSON.parse(stored) : null;
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
//   const loginUser = async (credentials) => {
//     try {
//       let response;

//       if (credentials.email && credentials.password) {
//         response = await axiosInstance.post('/api/users/token/', credentials);
//       } else if (credentials.access_token) {
//         response = await axiosInstance.post('/api/users/token/', {
//           access_token: credentials.access_token,
//         });
//       } else {
//         throw new Error('Invalid login credentials');
//       }

//       const { access, refresh, role } = response.data;
//       const decoded = jwtDecode(access);
//       const updatedUser = { ...decoded, role };

//       setAuthTokens({ access, refresh, role });
//       setUser(updatedUser);
//       localStorage.setItem('authTokens', JSON.stringify({ access, refresh, role }));
//       notify('Logged in successfully.');
//       navigate('/dashboard');
//     } catch (error) {
//       const errMsg = error.response?.data?.detail || 'Login failed. Please try again.';
//       notify(errMsg, 'error');
//     }
//   };


const loginUser = async (credentials) => {
  try {
    let response;

      if (credentials.email && credentials.password) {
      response = await axiosInstance.post('/api/users/token/', credentials);
    } else if (credentials.provider) {
      response = await axiosInstance.post('/api/users/token/', {
        access_token: credentials.access_token,
        provider: credentials.provider,
        code: credentials.code || null,
      });

    } else {
      throw new Error('Invalid login credentials');
    }


    const { access, refresh, role } = response.data;
    const decoded = jwtDecode(access);
    const updatedUser = { ...decoded, role };

    setAuthTokens({ access, refresh, role });
    setUser(updatedUser);
    localStorage.setItem(
      'authTokens', 
      JSON.stringify({ access, refresh, role })
    );
  
    notify('Logged in successfully.');
    navigate('/dashboard');
  } catch (error) {
    const errorMsg = error.response?.data?.detail || 'Login failed. Please try again.';
    notify(errorMsg, 'error');
  }
};

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
      const decoded = jwtDecode(access);

      const updatedTokens = { ...authTokens, access, role };
      setAuthTokens(updatedTokens);
      setUser({ ...decoded, role });
      localStorage.setItem('authTokens', JSON.stringify(updatedTokens));
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

    const decoded = jwtDecode(authTokens.access);
    const expiration = dayjs.unix(decoded.exp);
    const timeUntilExpiry = expiration.diff(dayjs(), 'milliseconds');

    const timeout = setTimeout(() => refreshToken(), timeUntilExpiry - 60 * 1000);
    setLoading(false);
    return () => clearTimeout(timeout);
  }, [authTokens]);

  // Sync with Local Storage Changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'authTokens') {
        const newTokens = event.newValue ? JSON.parse(event.newValue) : null;
        setAuthTokens(newTokens);

        if (newTokens) {
          const decoded = jwtDecode(newTokens.access);
          setUser({ ...decoded, role: newTokens.role || "" });
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
