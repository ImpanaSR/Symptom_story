// src/pages/PatientSignup.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import '../styles/PatientSignup.css';

function PatientSignup() {
  const { signup, navigate } = useAuth();
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

    setLoading(true);

    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'patient'
    });
    
    setLoading(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Account created successfully!' });
      setTimeout(() => {
        navigate('/patient-login');
      }, 1500);
    } else {
      setToast({ type: 'error', message: result.error });
    }
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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account?</p>
            <button 
              className="btn-link"
              onClick={() => navigate('/patient-login')}
            >
              Login here
            </button>
          </div>

          <button 
            className="btn-link"
            onClick={() => navigate('/')}
          >
            ← Back to role selection
          </button>
        </div>
      </main>
    </div>
  );
}

export default PatientSignup;
