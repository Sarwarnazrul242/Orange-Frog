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

  // Check if current path is in admin section
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomeRoute = location.pathname.startsWith('/home');
  
  // If trying to access admin route without admin role
  if (isAdminRoute && auth.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  // If trying to access user route as admin, allow it
  if (isHomeRoute && auth.role === 'admin') {
    return children;
  }

  // For all other routes, check if user has required role
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to={auth.role === 'admin' ? '/admin' : '/home'} replace />;
  }

  return children;
};

export default PrivateRoute; 