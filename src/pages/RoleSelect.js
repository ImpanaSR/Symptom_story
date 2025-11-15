// src/pages/RoleSelect.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelect.css'; // This import is correct!

const RoleSelect = () => {
  const navigate = useNavigate(); 

  const handlePatientClick = () => {
    navigate('/patient-login');
  };

  const handleDoctorClick = () => {
    navigate('/doctor-login');
  };

  // This HTML structure now MATCHES your CSS file
  return (
    <div className="role-select-container">
      
      {/* 1. Use 'role-select-main' to wrap the content */}
      <main className="role-select-main">
        
        <h2>Welcome to Symptom Storyteller</h2>
        <p>Please select your role to continue</p>
        
        {/* 2. Use 'role-cards' for the grid layout */}
        <div className="role-cards"> 
        
          {/* 3. Use 'role-card' for the button styling */}
          <button onClick={handlePatientClick} className="role-card patient">
            {/* You can add icons here later if you want */}
            <h3>Patient</h3>
            <p>Login or Signup to get an analysis.</p>
          </button>
          
          {/* 4. Use 'role-card' for the button styling */}
          <button onClick={handleDoctorClick} className="role-card doctor">
            <h3>Doctor</h3>
            <p>Login to view patient dashboards.</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default RoleSelect;