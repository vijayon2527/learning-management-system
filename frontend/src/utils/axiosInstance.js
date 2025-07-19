// src/utils/axiosInstance.js
import axios from 'axios';

/*
  BASE_URL priority:
  1. REACT_APP_API_URL (if defined in env at build time)
  2. window.location.origin (works when React is served by Django)
*/
const API_BASE = process.env.REACT_APP_API_URL || window.location.origin;

/* Read a cookie by name (needed for CSRF) */
function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/* Methods that do NOT require a CSRF header */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: true,         // allow cookies (csrftoken, sessionid)
  xsrfCookieName: 'csrftoken',   // axios built‑in XSRF support
  xsrfHeaderName: 'X-CSRFToken', // header Django expects
});

/* ----- Request Interceptor ----- */
axiosInstance.interceptors.request.use(
  (config) => {
    // Attach JWT access token (if any)
    const stored = localStorage.getItem('authTokens');
    if (stored) {
      try {
        const authTokens = JSON.parse(stored);
        if (authTokens?.access) {
          config.headers['Authorization'] = `Bearer ${authTokens.access}`;
        }
      } catch {
        /* ignore parse errors */
      }
    }

    // Attach CSRF token on unsafe methods
    const method = (config.method || 'get').toUpperCase();
    if (!SAFE_METHODS.includes(method)) {
      const csrftoken = getCookie('csrftoken');
      if (csrftoken) {
        config.headers['X-CSRFToken'] = csrftoken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ----- Response Interceptor (token refresh) ----- */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Timeout handling
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        error,
      });
    }

    // If 401 and we haven't retried yet, try refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      const stored = localStorage.getItem('authTokens');
      if (stored) {
        try {
          const authTokens = JSON.parse(stored);
          if (authTokens?.refresh) {
            // refresh token call (use root axios to avoid interceptor loop)
            const refreshResp = await axios.post(
              `${API_BASE}/api/users/token/refresh/`,
              { refresh: authTokens.refresh },
              { withCredentials: true }
            );

            // save new tokens
            localStorage.setItem('authTokens', JSON.stringify(refreshResp.data));

            // update header + retry original
            const newAccess = refreshResp.data.access;
            originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshErr) {
          // refresh failed; clear & redirect (adjust as needed)
          localStorage.removeItem('authTokens');
          window.location.href = '/';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
