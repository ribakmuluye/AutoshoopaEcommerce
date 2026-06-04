import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../layout/AdminLayout';

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  console.log('ProtectedAdminRoute - user:', user, 'isAuthenticated:', isAuthenticated);

  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin role - try different possible field names
  const isAdmin = user.user_type === 'admin' || user.role === 'admin' || user.isAdmin === true;
  console.log('User type check:', { user_type: user.user_type, role: user.role, isAdmin: user.isAdmin, isAdmin: isAdmin });

  if (!isAdmin) {
    console.log('Not an admin, redirecting to home');
    // Redirect to home if not an admin
    return <Navigate to="/" replace />;
  }

  console.log('Admin access granted');
  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedAdminRoute; 