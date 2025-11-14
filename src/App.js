// src/App.js
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import RoleSelect from './pages/RoleSelect';
import DoctorLogin from './pages/DoctorLogin';
import PatientLogin from './pages/PatientLogin';
import PatientSignup from './pages/PatientSignup';
import DoctorHomePage from './pages/DoctorHomePage';
import PatientHomePage from './pages/PatientHomePage';

function App() {
  // State-based navigation - tracks current page
  const [page, setPage] = useState('role');

  // Navigation helper function
  const navigateTo = (pageName) => {
    setPage(pageName);
  };

  // Handle logout - navigates back to role selection page
  const handleLogout = () => {
    setPage('role');
  };

  // Render appropriate page based on current page state
  const renderPage = () => {
    switch (page) {
      case 'role':
        return <RoleSelect />;
      case 'doctor-login':
        return <DoctorLogin />;
      case 'patient-login':
        return <PatientLogin />;
      case 'patient-signup':
        return <PatientSignup />;
      case 'doctor-home':
        return <DoctorHomePage onLogout={handleLogout} />;
      case 'patient-home':
        return <PatientHomePage onLogout={handleLogout} />;
      default:
        return <RoleSelect />;
    }
  };

  return (
    <AuthProvider navigateTo={navigateTo}>
      {renderPage()}
    </AuthProvider>
  );
}

export default App;