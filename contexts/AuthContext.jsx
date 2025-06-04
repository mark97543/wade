// /home/mark/Documents/wade/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createDirectus, login, refresh, logout, readMe } from '@directus/sdk';


const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL);
console.log('AuthContext: Directus client initialized (after createDirectus) =', directus);


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
const checkAuthSession = async () => {
  try {
    const accessToken = localStorage.getItem('directus_access_token');
    const refreshToken = localStorage.getItem('directus_refresh_token');

    if (accessToken && refreshToken) {
      try {
        // Directus SDK v19: Use the imported refresh function
        await refresh(directus);

        // Directus SDK v19: Use the imported readMe function
        const currentUser = await readMe(directus);
        setUser(currentUser);

      } catch (refreshError) {
        console.warn('Access token expired or refresh failed, requiring re-login:', refreshError);
        localStorage.removeItem('directus_access_token');
        localStorage.removeItem('directus_refresh_token');
        setUser(null);
        setAuthError(refreshError.message || 'Session invalid, please log in again.');
      }
    }
  } catch (error) {
    console.error('Initial authentication check failed, clearing session:', error);
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

const login = async (email, password) => {
  setAuthError(null);
  try {
    // Directus SDK v19: Use the imported login function
    const response = await login(directus, { email, password });
    localStorage.setItem('directus_access_token', response.access_token);
    localStorage.setItem('directus_refresh_token', response.refresh_token);

    // After login, fetch user details using the imported readMe function
    const currentUser = await readMe(directus);
    setUser(currentUser);
    return true;
  } catch (error) {
    console.error('Login failed in AuthContext:', error);
    const errorMessage = error.errors ? error.errors[0].message : error.message || 'Login failed.';
    setAuthError(errorMessage);
    throw new Error(errorMessage);
  }
};

const logout = async () => {
  try {
    // Directus SDK v19: Use the imported logout function
    await logout(directus);
  } catch (error) {
    console.error('Logout failed with Directus:', error);
  } finally {
    localStorage.removeItem('directus_access_token');
    localStorage.removeItem('directus_refresh_token');
    setUser(null);
    setAuthError(null);
  }
};

  const authContextValue = {
    user,
    directus,
    isLoggedIn: !!user,
    loading,
    authError,
    login,
    logout,
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