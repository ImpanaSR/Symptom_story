// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Hook to use auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedRole = localStorage.getItem('currentRole');
      
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          setRole(savedRole || userData.role);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('currentRole');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function - calls backend API
  const login = async (username, password, userRole) => {
    try {
      const response = await authAPI.login(username, password);
      
      // Store token
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('currentRole', userRole);
      
      // Fetch user data
      const userData = await authAPI.getMe();
      setUser(userData);
      setRole(userRole);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentRole');
    navigate('/');
  };

  // Signup function - calls backend API
  const signup = async (userData) => {
    try {
      await authAPI.signup(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    signup,
    navigate  // Now using navigate from React Router
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
