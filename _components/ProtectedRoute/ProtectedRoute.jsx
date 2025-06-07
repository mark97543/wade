// /home/mark/Documents/wade/_components/ProtectedRoute/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@wade-usa/contexts/AuthContext'; // Import your auth hook

// Using your specified import paths and component names
import Forbbiden from '../../1_client/src/pages/forbidden/Forbbiden.jsx'; // <--- Corrected import path/name
import Pending_User from '../../1_client/src/pages/Pending_User/Pending_User.jsx'; // <--- Corrected import path/name


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, loading, user } = useAuth(); // Get auth state, loading, AND user object

  // Debugging log for the user object
  console.log('ProtectedRoute: current user object:', user);

  if (loading) {
    // Show a loading indicator while auth status is being determined
    return <div>Loading authentication...</div>;
  }

  if (!isLoggedIn) {
    // User is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in, now check their role
  if (user && user.role) { // Ensure user and user.role exist
    const userRoleName = user.role.name.toLowerCase(); // Convert to lowercase for consistent comparison

    // Special case: If user's role is 'pending', always show Pending_User page
    // Ensure 'pending' matches the exact case in Strapi
    if (userRoleName === 'pending') {
      return <Pending_User />; // Render the Pending_User component directly
    }

    // If specific allowedRoles are provided, check if user's role is included
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRoleName)) {
        // User is logged in, not 'pending', but does NOT have an allowed role
        return <Navigate to="/forbidden" replace />; // Redirect to a forbidden page
      }
    }

  } else {
    // This case should ideally not happen if isLoggedIn is true and user object is correctly populated.
    // It's a fallback for unexpected user state or incomplete user data.
    console.warn('User is logged in but user object or role is missing. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  // User is logged in, not 'pending', AND has an allowed role (if specified), render the children
  return children;
};

export default ProtectedRoute;