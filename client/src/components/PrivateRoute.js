import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!auth.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to reset-password if reset is required
  if (auth.resetRequired) {
    return <Navigate to="/reset-password" replace />;
  }

  // Redirect to complete-profile if profile completion is required
  if (auth.completeProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check if current path is in admin section
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserRoute = location.pathname.startsWith('/user');

  // Redirect to appropriate dashboards
  if (isAdminRoute && auth.role !== 'admin') {
    return <Navigate to="/user-dashboard" replace />;
  }

  if (isUserRoute && auth.role !== 'user') {
    return <Navigate to="/admin" replace />;
  }

  // Role-specific checks for access
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to={auth.role === 'admin' ? '/admin' : '/user-dashboard'} replace />;
  }

  return children;
};

export default PrivateRoute;
