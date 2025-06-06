import React, { createContext, useState, useEffect, useContext } from 'react';
import { createDirectus, login, refresh, logout, readMe, createUsers } from '@directus/sdk';


const directus = createDirectus(import.meta.env.VITE_DIRECTUS_URL);


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
            await refresh(directus);
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

  const performLogin = async (email, password) => {
    setAuthError(null);
    try {
      const response = await login(directus, { email, password });
      localStorage.setItem('directus_access_token', response.access_token);
      localStorage.setItem('directus_refresh_token', response.refresh_token);

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

  const performLogout = async () => {
    try {
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
  
  const performRegistration = async (userData) => {
    setAuthError(null);
    try {
        const ROLE_ID = '81ce4fc0-85d3-4855-ba46-cc1814812b4a';

        const userToCreate = {
            ...userData,
            role: ROLE_ID,
            status: 'active',
        };

        await createUsers(directus, [userToCreate]);
        return true;
    } catch (error) {
        console.error('Registration failed in AuthContext:', error);
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