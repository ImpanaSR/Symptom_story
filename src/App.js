import React from 'react';
// 1. Import the routing components
import { Routes, Route } from 'react-router-dom'; 

import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import RoleSelect from './pages/RoleSelect';
import DoctorLogin from './pages/DoctorLogin';
import PatientLogin from './pages/PatientLogin';
import PatientSignup from './pages/PatientSignup';
import DoctorHomePage from './pages/DoctorHomePage';
import PatientHomePage from './pages/PatientHomePage';
import './styles/global.css';

function App() {
  // 2. No more useState or switch statements for navigation!
  
  return (
    // 3. AuthProvider is now INSIDE the router (from index.js)
    // This allows AuthProvider (and all its children) to use hooks like useNavigate
    <AuthProvider>
      {/* Header is outside Routes so it shows on every page */}
      <Header />
      
      {/* 4. Routes defines all your pages */}
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/patient-signup" element={<PatientSignup />} />
        <Route path="/patient-home" element={<PatientHomePage />} />
        <Route path="/doctor-home" element={<DoctorHomePage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;