// src/components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Symptom Storyteller</h1>
        {user && (
          <div className="header-user">
            <span className="user-name">{user.name}</span>
            <button 
              className="btn-header-logout" 
              onClick={logout}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;