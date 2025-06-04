// /home/mark/Documents/wade/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createDirectus } from '@directus/sdk'; // Import the factory function
const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL); // Use the factory function

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        const accessToken = localStorage.getItem('directus_access_token'); //
        const refreshToken = localStorage.getItem('directus_refresh_token'); //

        if (accessToken && refreshToken) {
          try {
            // For v10.x.x, directus.auth.me() is NOT a function.
            // You usually use directus.users.me.read() or similar structure.
            // Also, directus.auth.refresh() needs to be handled carefully with implicit tokens.
            // Let's assume the Directus instance automatically uses stored tokens
            // for auth.refresh and then directus.users.me.read().

            // Attempt to refresh token using the SDK's auth.refresh.
            // In v10, you often call refresh without explicitly passing the token if stored.
            // The SDK is designed to use the refresh token from storage.
            // Directus v10.x.x refresh often implicitly stores tokens on the SDK instance too.
            await directus.auth.refresh(); // This tries to use the stored refresh_token

            // Then, get the user info using the users service (which should be authenticated now)
            const currentUser = await directus.users.me.read();
            setUser(currentUser);

          } catch (refreshError) {
            console.warn('Access token expired or refresh failed, requiring re-login:', refreshError);
            localStorage.removeItem('directus_access_token'); //
            localStorage.removeItem('directus_refresh_token'); //
            setUser(null);
            setAuthError(refreshError.message || 'Session invalid, please log in again.');
          }
        }
      } catch (error) {
        console.error('Initial authentication check failed, clearing session:', error);
        localStorage.removeItem('directus_access_token'); //
        localStorage.removeItem('directus_refresh_token'); //
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
      const response = await directus.auth.login({ email, password }); //
      localStorage.setItem('directus_access_token', response.access_token); //
      localStorage.setItem('directus_refresh_token', response.refresh_token); //

      // After login, fetch user details using the users service
      const currentUser = await directus.users.me.read();
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
      await directus.auth.logout();
    } catch (error) {
      console.error('Logout failed with Directus:', error);
    } finally {
      localStorage.removeItem('directus_access_token'); //
      localStorage.removeItem('directus_refresh_token'); //
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