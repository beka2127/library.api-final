import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MainApp from './components/MainApp/MainApp'; // Import MainApp

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Check for token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginView(false); // Ensure login form is hidden
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsLoginView(true); // Show login form after logout
  };

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className="container">
      {isLoggedIn ? (
        <MainApp onLogout={handleLogout} />
      ) : (
        isLoginView ? (
          <Login onLoginSuccess={handleLoginSuccess} onToggleView={handleToggleView} />
        ) : (
          <Register onToggleView={handleToggleView} />
        )
      )}
    </div>
  );
}

export default App;