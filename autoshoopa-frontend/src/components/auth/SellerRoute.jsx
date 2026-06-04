import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SellerRoute = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.user_type !== 'seller') {
    return <Navigate to="/" />;
  }

  if (!user?.is_approved) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default SellerRoute; 