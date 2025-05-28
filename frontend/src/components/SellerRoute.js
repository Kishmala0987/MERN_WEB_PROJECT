import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SellerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ message: 'Please login to access seller features' }} />;
  }

  // If authenticated but not a seller, redirect to home
  if (user?.userType !== 'seller') {
    return <Navigate to="/" state={{ message: 'Access denied. Seller account required.' }} />;
  }

  // If authenticated and is a seller, render the protected component
  return children;
};

export default SellerRoute;