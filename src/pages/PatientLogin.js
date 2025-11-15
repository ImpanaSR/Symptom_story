// src/pages/PatientLogin.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import '../styles/PatientLogin.css';

function PatientLogin() {
  const { login, navigate } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);

    // Call API login
    const result = await login(email, password, 'patient');
    
    setLoading(false);

    if (result.success) {
      navigate('/patient-home');
    } else {
      setToast({ type: 'error', message: result.error || 'Invalid email or password' });
    }
  };

  return (
    <div className="patient-login-container">
      {loading && <Spinner />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <main className="patient-login-main">
        <div className="login-card">
          <h1>Patient Login</h1>
          <p className="subtitle">Continue your health journey</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="signup-link">
            <p>Don't have an account?</p>
            <button 
              className="btn-link"
              onClick={() => navigate('/patient-signup')}
            >
              Sign up here
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

export default PatientLogin;
