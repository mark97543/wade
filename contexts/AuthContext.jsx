// /home/mark/Documents/wade/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Import Axios

const STRAPI_API_BASE_URL = import.meta.env.VITE_DIRECTUS_URL;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        const jwt = localStorage.getItem('strapi_jwt');
        if (jwt) {
          try {
            // Validate JWT by trying to fetch user data and populate the role
            // CRITICAL FIX: Ensure ?populate=role is here to get user role information
            const response = await axios.get(`${STRAPI_API_BASE_URL}/api/users/me?populate=role`, {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
            setUser(response.data);
            console.log('AuthContext: User data fetched on session check (with role):', response.data); // Debugging log
          } catch (tokenError) {
            console.warn('JWT invalid or expired, requiring re-login:', tokenError);
            localStorage.removeItem('strapi_jwt');
            setUser(null);
            setAuthError(tokenError.message || 'Session invalid, please log in again.');
          }
        }
      } catch (error) {
        console.error('Initial authentication check failed, clearing session:', error);
        localStorage.removeItem('strapi_jwt');
        setUser(null);
        setAuthError(error.message || 'Failed to authenticate session.');
      } finally {
        setLoading(false);
      }
    };
    checkAuthSession();
  }, []);

  const performLogin = async (email, password) => {
    setAuthError(null);
    try {
      const trimmedEmail = email.toString().trim();
      const trimmedPassword = password.toString().trim();

      // Strapi Login Endpoint
      const response = await axios.post(`${STRAPI_API_BASE_URL}/api/auth/local`, {
        identifier: trimmedEmail, // Strapi uses 'identifier' for email/username
        password: trimmedPassword,
      });

      const jwt = response.data.jwt;
      localStorage.setItem('strapi_jwt', jwt);

      // CRITICAL FIX: After a successful login, immediately fetch the user with their role populated.
      // The initial login response from /api/auth/local does NOT include the role.
      const userWithRoleResponse = await axios.get(`${STRAPI_API_BASE_URL}/api/users/me?populate=role`, {
          headers: {
              Authorization: `Bearer ${jwt}`,
          },
      });
      setUser(userWithRoleResponse.data);
      console.log('AuthContext: User data set on login (fetched with role):', userWithRoleResponse.data); // Debugging log
      return true;
    } catch (error) {
      console.error('Login failed in AuthContext:', error.response ? error.response.data : error.message);
      const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message
        ? error.response.data.error.message
        : error.message || 'Login failed.';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const performLogout = async () => {
    try {
      console.log('Strapi API logout not typically needed for JWT. Clearing client-side token.');
    } catch (error) {
      console.error('Logout failed with Strapi (client-side):', error);
    } finally {
      console.log('Attempting to remove strapi_jwt from localStorage. User state cleared.');
      localStorage.removeItem('strapi_jwt');
      setUser(null);
      setAuthError(null);
    }
  };

  const performRegistration = async (userData) => {
    setAuthError(null);
    try {
        const response = await axios.post(`${STRAPI_API_BASE_URL}/api/auth/local/register`, {
            username: userData.email, // Use email as username for simplicity, or add a username field
            email: userData.email,
            password: userData.password,
        });
        const jwt = response.data.jwt;
        localStorage.setItem('strapi_jwt', jwt);

        // CRITICAL FIX: After a successful registration, immediately fetch the user with their role populated.
        // The initial registration response from /api/auth/local/register does NOT include the role.
        const userWithRoleResponse = await axios.get(`${STRAPI_API_BASE_URL}/api/users/me?populate=role`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        setUser(userWithRoleResponse.data);
        console.log('AuthContext: User data set on registration (fetched with role):', userWithRoleResponse.data); // Debugging log

        return true;
    } catch (error) {
        console.error('Registration failed in AuthContext:', error.response ? error.response.data : error.message);
        const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message
          ? error.response.data.error.message
          : error.message || 'Registration failed.';
        setAuthError(errorMessage);
        throw new Error(errorMessage);
    }
  };

  const authContextValue = {
    user,
    isLoggedIn: !!user,
    loading,
    authError,
    login: performLogin,
    logout: performLogout,
    register: performRegistration,
  };

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};