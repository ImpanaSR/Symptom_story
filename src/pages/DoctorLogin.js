// src/pages/DoctorLogin.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import '../styles/DoctorLogin.css';

function DoctorLogin() {
  const { login, navigateTo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Hardcoded doctor credentials
  const DOCTOR_EMAIL = 'doc@example.com';
  const DOCTOR_PASSWORD = 'password123';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);

    // Simulate network latency
    setTimeout(() => {
      // Check credentials
      if (email === DOCTOR_EMAIL && password === DOCTOR_PASSWORD) {
        const doctorUser = {
          name: 'Dr. Example',
          email: email
        };
        login(doctorUser, 'doctor');
        navigateTo('doctor-home');
      } else {
        setToast({ type: 'error', message: 'Invalid email or password' });
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="doctor-login-container">
      {loading && <Spinner />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <main className="doctor-login-main">
        <div className="login-card">
          <h1>Doctor Login</h1>
          <p className="subtitle">Access your patient dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doc@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Login
            </button>
          </form>

          <button 
            className="btn-link"
            onClick={() => navigateTo('role')}
          >
            ← Back to role selection
          </button>
        </div>
      </main>
    </div>
  );
}

export default DoctorLogin;