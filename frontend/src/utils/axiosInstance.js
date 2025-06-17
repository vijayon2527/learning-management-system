import axios from 'axios';

// Define the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_URL;

// Create an Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // Add timeout of 5 seconds for all requests
});

// Interceptor for adding the token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    if (authTokens && authTokens.access) {
      config.headers['Authorization'] = `Bearer ${authTokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for handling responses and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the response if successful
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle request timeout errors
    if (error.code === 'ECONNABORTED' || error.message === 'timeout of 5000ms exceeded') {
      console.error('Request timeout:', error.message);
      return Promise.reject({ message: 'Request timed out. Please try again later.', error });
    }

    // Check for token expiration (401) and handle token refresh if needed
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const authTokens = JSON.parse(localStorage.getItem('authTokens'));

      if (authTokens && authTokens.refresh) {
        try {
          // Attempt to refresh the token using the refresh token
          const refreshResponse = await axios.post(`${BASE_URL}/api/users/token/refresh/`, {
            refresh: authTokens.refresh,
          });

          // Update the authTokens in localStorage
          localStorage.setItem('authTokens', JSON.stringify(refreshResponse.data));

          // Update the Authorization header for the original request with the new token
          axios.defaults.headers['Authorization'] = `Bearer ${refreshResponse.data.access}`;
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.access}`;

          // Retry the original request with the new access token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Handle token refresh failure (e.g., log the user out)
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('authTokens');
          window.location.href = '/'; // Redirect to login
          return Promise.reject(refreshError);
        }
      }
    }

    // Log and handle other errors (e.g., network issues, server errors)
    console.error('Request failed:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
