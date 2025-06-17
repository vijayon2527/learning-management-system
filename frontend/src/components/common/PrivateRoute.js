import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/" />;
  }

  // If requiredRole is specified and doesn't match user role, redirect to 404
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/404" replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default PrivateRoute;
