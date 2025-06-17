import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const RoleWrapper = ({ requiredRole, children }) => {
  const { user } = useContext(AuthContext);

  if (!user || !user.role) {
    return null; // No user or permissions available
  }

  const hasPermission = () => {
    if (Array.isArray(requiredRole)) {
      // Check if user has at least one required permission
      return requiredRole.some((role) => user.role.includes(role));
    }
    // Single permission check
    return user.role.includes(requiredRole);
  };

  return hasPermission() ? <>{children}</> : null;
};

export default RoleWrapper;
