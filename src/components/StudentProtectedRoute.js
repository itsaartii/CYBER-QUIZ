import React from 'react';
import { Navigate } from 'react-router-dom';

const StudentProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('studentAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Redirect to student login if not authenticated
    return <Navigate to="/student/login" replace state={{ message: 'Please log in to access this page.' }} />;
  }

  return children;
};

export default StudentProtectedRoute; 