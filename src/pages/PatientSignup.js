// src/pages/PatientSignup.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import '../styles/PatientSignup.css';

function PatientSignup() {
  const { signup, navigateTo } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    // Check if email already exists
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    if (patients.find(p => p.email === formData.email)) {
      setToast({ type: 'error', message: 'Email already registered' });
      return;
    }

    setLoading(true);

    // Simulate network latency
    setTimeout(() => {
      const patientObj = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      signup(patientObj);
      setLoading(false);
      setToast({ type: 'success', message: 'Account created successfully!' });
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigateTo('patient-login');
      }, 1500);
    }, 600);
  };

  return (
    <div className="patient-signup-container">
      {loading && <Spinner />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <main className="patient-signup-main">
        <div className="signup-card">
          <h1>Create Patient Account</h1>
          <p className="subtitle">Start sharing your health story</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Sign Up
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account?</p>
            <button 
              className="btn-link"
              onClick={() => navigateTo('patient-login')}
            >
              Login here
            </button>
          </div>

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

export default PatientSignup;