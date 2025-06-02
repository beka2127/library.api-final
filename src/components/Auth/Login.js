import React, { useState } from 'react';

function Login({ onLoginSuccess, onToggleView }) { // Added onLoginSuccess, kept onToggleView
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages, if any

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setMessage(''); // Clear previous messages

    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      // Replace with your actual backend API URL
      const API_BASE_URL = 'https://localhost:7086'; // Ensure this matches your backend's HTTPS port
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        setMessage('Login successful!');
        // Store the token (e.g., in localStorage)
        localStorage.setItem('token', data.token);
        // Call the prop function to update App.js state, which then displays MainApp
        onLoginSuccess();
        console.log('Token:', data.token);
        console.log('Expiration:', data.expiration);
      } else {
        // Login failed
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server is unreachable.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit" className="btn">Login</button>
      </form>
      <p className="toggle-link" onClick={onToggleView}> {/* Uses onClick for toggling */}
        Don't have an account? Register here.
      </p>
    </div>
  );
}

export default Login;