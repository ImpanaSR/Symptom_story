// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Hook to use auth context in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, navigateTo }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Check localStorage on mount to restore patient session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentRole');
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
  }, []);

  // Login function - stores user and role
  const login = (userObj, userRole) => {
    setUser(userObj);
    setRole(userRole);
    // Persist patient login to localStorage
    if (userRole === 'patient') {
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      localStorage.setItem('currentRole', userRole);
    }
  };

  // Logout function - clears auth and returns to role select
  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    navigateTo('role');
  };

  // Signup function - saves patient to localStorage
  const signup = (patientObj) => {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    patients.push(patientObj);
    localStorage.setItem('patients', JSON.stringify(patients));
  };

  const value = {
    user,
    role,
    login,
    logout,
    signup,
    navigateTo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};