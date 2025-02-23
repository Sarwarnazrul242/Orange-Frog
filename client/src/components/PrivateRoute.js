import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import jwt_decode from 'jwt-decode'; // To decode and verify JWT token expiration

const PrivateRoute = ({ children, allowedRoles }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  // Get JWT token from localStorage
  const token = localStorage.getItem('authToken');

  // If no token or the token is invalid/expired, redirect to login
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Decode token to get expiration date and other user details
  let decodedToken;
  try {
    decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    if (decodedToken.exp < currentTime) {
      // Token is expired
      localStorage.removeItem('authToken');
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  } catch (error) {
    // Invalid token
    localStorage.removeItem('authToken');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Update auth context with token details
  if (!auth.isAuthenticated) {
    auth.isAuthenticated = true;
    auth.role = decodedToken.role;
    auth.userId = decodedToken.userId;
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
