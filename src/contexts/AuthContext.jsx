import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await loginAPI(email, password);
    localStorage.setItem('token', response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const isCLevel = () => hasRole('C_LEVEL', 'ADMIN');
  const isProjectDev = () => hasRole('PROJECT_DEV', 'ADMIN');
  const isAdmin = () => hasRole('ADMIN');

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    hasRole,
    isCLevel,
    isProjectDev,
    isAdmin,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
