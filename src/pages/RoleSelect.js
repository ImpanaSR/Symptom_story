// src/pages/RoleSelect.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/RoleSelect.css';

function RoleSelect() {
  const { navigateTo } = useAuth();

  return (
    <div className="role-select-container">
      <main className="role-select-main">
        <h1>Symptom Storyteller</h1>
        <h2>Are you a Doctor or a Patient?</h2>
        
        <div className="role-cards">
          {/* Doctor role card */}
          <button
            className="role-card"
            onClick={() => navigateTo('doctor-login')}
            aria-label="Select Doctor role"
          >
            <div className="role-icon">👨‍⚕️</div>
            <h3>Doctor</h3>
            <p>Access patient symptom stories and medical records</p>
          </button>

          {/* Patient role card */}
          <button
            className="role-card"
            onClick={() => navigateTo('patient-login')}
            aria-label="Select Patient role"
          >
            <div className="role-icon">🧑‍🦱</div>
            <h3>Patient</h3>
            <p>Share your symptom stories with your healthcare provider</p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default RoleSelect;