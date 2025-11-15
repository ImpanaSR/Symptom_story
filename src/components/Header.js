import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Symptom Storyteller</Link>
      </div>
      <nav>
        {currentUser ? (
          <>
            <span>Welcome, {currentUser.username}</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </>
        ) : (
          <Link to="/">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;