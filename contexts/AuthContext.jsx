// /home/mark/Documents/wade/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Import Axios

// --- IMPORTANT: Strapi API Base URL ---
// This should point to your local Strapi API URL (http://localhost:1337)
// You should continue to get this from import.meta.env.VITE_DIRECTUS_URL
// which you updated to http://localhost:1337 in bash/.env
const STRAPI_API_BASE_URL = import.meta.env.VITE_DIRECTUS_URL;

//console.log('AuthContext: Strapi API URL used =', STRAPI_API_BASE_URL);


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        //console.log('Checking for stored tokens...');
        const jwt = localStorage.getItem('strapi_jwt'); // Strapi uses 'jwt' for its token
        //console.log('Found JWT:', !!jwt);

        if (jwt) {
          try {
            // Validate JWT by trying to fetch user data
            const response = await axios.get(`${STRAPI_API_BASE_URL}/api/users/me`, {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            });
            setUser(response.data);
          } catch (tokenError) {
            console.warn('JWT invalid or expired, requiring re-login:', tokenError);
            //console.log('Clearing stale JWT from localStorage due to validation failure.');
            localStorage.removeItem('strapi_jwt');
            setUser(null);
            setAuthError(tokenError.message || 'Session invalid, please log in again.');
          }
        }
      } catch (error) {
        console.error('Initial authentication check failed, clearing session:', error);
        //console.log('Clearing JWT from localStorage due to initial auth check failure.');
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

      //console.log('3. Inside performLogin in AuthContext.');
      //console.log('4. Attempting to call the Strapi API login...');
      //console.log('Login Payload being sent:', { identifier: trimmedEmail, password: trimmedPassword });
      //console.log('Type of identifier in payload:', typeof trimmedEmail);
      //console.log('Type of password in payload:', typeof trimmedPassword);

      // Strapi Login Endpoint
      const response = await axios.post(`${STRAPI_API_BASE_URL}/api/auth/local`, {
        identifier: trimmedEmail, // Strapi uses 'identifier' for email/username
        password: trimmedPassword,
      });

      const jwt = response.data.jwt;
      const userData = response.data.user;

      localStorage.setItem('strapi_jwt', jwt); // Store Strapi's JWT
      setUser(userData);
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
      // No explicit logout API for Strapi JWT, just clear client-side token
      //console.log('Strapi API logout not typically needed for JWT. Clearing client-side token.');
    } catch (error) {
      console.error('Logout failed with Strapi (client-side):', error);
    } finally {
      //console.log('Attempting to remove strapi_jwt from localStorage. User state cleared.');
      localStorage.removeItem('strapi_jwt');
      setUser(null);
      setAuthError(null);
    }
  };

  const performRegistration = async (userData) => {
    setAuthError(null);
    //console.log('3. performRegistration in context has been called with:', userData);
    try {
        // Strapi Registration Endpoint
        const response = await axios.post(`${STRAPI_API_BASE_URL}/api/auth/local/register`, {
            username: userData.email, // Use email as username for simplicity, or add a username field
            email: userData.email,
            password: userData.password,
        });
        //console.log('Strapi registration response:', response.data);

        // After successful registration, log the user in immediately
        const jwt = response.data.jwt;
        const userAfterRegister = response.data.user;
        localStorage.setItem('strapi_jwt', jwt);
        setUser(userAfterRegister);

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
    // directus removed as we are using axios directly
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