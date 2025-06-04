import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@wade-usa/contexts/AuthContext'; // Import your auth hook

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth(); // Get auth state and loading status

  if (loading) {
    // You might want a better loading indicator here, e.g., a spinner
    return <div>Loading authentication...</div>;
  }

  if (!isLoggedIn) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the children (the protected component)
  return children;
};

export default ProtectedRoute;