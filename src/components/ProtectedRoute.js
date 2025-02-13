import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Redirect to institute login if not authenticated
    return <Navigate to="/admin/login" replace state={{ message: 'Please log in with your institute credentials to access this page.' }} />;
  }

  return children;
};

export default ProtectedRoute; 