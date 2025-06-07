// contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createDirectus, login, refresh, logout, readMe, createUsers, rest } from '@directus/sdk'; //


const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL).with(rest()); //
console.log('AuthContext: Directus URL used =', import.meta.env.VITE_DIRECTUS_URL);
console.log('AuthContext: Directus client instance after .with(rest()):', directus);


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        console.log('Checking for stored tokens...');
        const accessToken = localStorage.getItem('directus_access_token');
        const refreshToken = localStorage.getItem('directus_refresh_token');
        console.log('Found accessToken:', !!accessToken, 'Found refreshToken:', !!refreshToken); //

        if (accessToken && refreshToken) {
          try {
            await directus.request(refresh());
            const currentUser = await directus.request(readMe());
            setUser(currentUser);

          } catch (refreshError) {
            console.warn('Access token expired or refresh failed, requiring re-login:', refreshError);
            console.log('Clearing stale tokens from localStorage due to refresh failure.');
            localStorage.removeItem('directus_access_token');
            localStorage.removeItem('directus_refresh_token');
            setUser(null);
            setAuthError(refreshError.message || 'Session invalid, please log in again.');
          }
        }
      } catch (error) {
        console.error('Initial authentication check failed, clearing session:', error);
        console.log('Clearing tokens from localStorage due to initial auth check failure.');
        localStorage.removeItem('directus_access_token');
        localStorage.removeItem('directus_refresh_token');
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
    console.log('3. Inside performLogin in AuthContext.');
    try {
      console.log('4. Attempting to call the Directus SDK login...');
      const loginPayload = { email, password };
      console.log('Login Payload being sent:', loginPayload); //
      console.log('Type of email in payload:', typeof loginPayload.email); //
      console.log('Type of password in payload:', typeof loginPayload.password); //
      const response = await directus.request(login(loginPayload));

      console.log('5a. Directus SDK login call completed.');
      console.log('5b. Full response from Directus login:', response);
      console.log('5c. Response access_token:', response?.access_token);
      console.log('5d. Response refresh_token:', response?.refresh_token);

      localStorage.setItem('directus_access_token', response.access_token);
      localStorage.setItem('directus_refresh_token', response.refresh_token);
      console.log('Tokens set in localStorage.');

      console.log('Attempting to read current user details...');
      const currentUser = await directus.request(readMe());
      console.log('Current user details received:', currentUser);
      setUser(currentUser);
      return true;
    } catch (error) {
      // --- NEW LOGS HERE ---
      console.error('Login failed in AuthContext. Full error object:', error);
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err, index) => {
          console.error(`Error ${index + 1} details:`, err);
          console.error(`  Message: ${err.message}`);
          if (err.extensions) {
            console.error(`  Code: ${err.extensions.code}`);
            console.error(`  Field: ${err.extensions.field}`); // If a field is specified
          }
        });
      }
      // --- END NEW LOGS ---
      const errorMessage = error.errors ? error.errors[0].message : error.message || 'Login failed.';
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const performLogout = async () => {
    try {
      await directus.request(logout());
      console.log('Directus server logout successful.');
    } catch (error) {
      console.error('Logout failed with Directus:', error);
    } finally {
      console.log('Attempting to remove access_token from localStorage.');
      localStorage.removeItem('directus_access_token');
      console.log('Attempting to remove refresh_token from localStorage.');
      localStorage.removeItem('directus_refresh_token');
      console.log('Tokens removed from localStorage. User state cleared.');
      setUser(null);
      setAuthError(null);
    }
  };

  const performRegistration = async (userData) => {
    setAuthError(null);
    console.log('3. performRegistration in context has been called with:', userData);
    try {
        const ROLE_ID = '81ce4fc0-85d3-4855-ba46-cc1814812b4a'; // You might want to get this dynamically or from .env

        const userToCreate = {
            ...userData,
            role: ROLE_ID,
            status: 'active',
        };

        const registrationResponse = await directus.request(createUsers([userToCreate]));
        console.log('Directus registration response:', registrationResponse);
        return true;
    } catch (error) {
        console.error('Registration failed in AuthContext:', error);
        // --- NEW LOGS HERE ---
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err, index) => {
            console.error(`Registration Error ${index + 1} details:`, err);
            console.error(`  Message: ${err.message}`);
            if (err.extensions) {
              console.error(`  Code: ${err.extensions.code}`);
              console.error(`  Field: ${err.extensions.field}`);
            }
          });
        }
        // --- END NEW LOGS ---
        const errorMessage = error.errors ? error.errors[0].message : error.message || 'Registration failed.';
        setAuthError(errorMessage);
        throw new Error(errorMessage);
    }
  };


  const authContextValue = {
    user,
    directus,
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