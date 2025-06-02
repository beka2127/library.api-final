import React, { useState, useEffect } from 'react';
import './MainApp.css'; // We'll create this CSS file next
import BooksList from '../Books/BooksList'; // Will create this soon
import BorrowersList from '../Borrowers/BorrowersList'; // Will create this soon
import LoansList from '../Loans/LoansList'; // Will create this soon

function MainApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'borrowers', 'loans'
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from local storage

  useEffect(() => {
    // You might want to periodically check token validity here
    // or re-authenticate if the token expires.
    // For now, we'll assume the token from localStorage is valid.
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (!token) {
    // If for some reason token is null here, redirect to logout
    onLogout();
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="main-app-container">
      <header className="app-header">
        <h1>Library Management System</h1>
        <button className="btn logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => handleTabClick('books')}
        >
          Books
        </button>
        <button
          className={`tab-btn ${activeTab === 'borrowers' ? 'active' : ''}`}
          onClick={() => handleTabClick('borrowers')}
        >
          Borrowers
        </button>
        <button
          className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => handleTabClick('loans')}
        >
          Loans
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'books' && <BooksList token={token} />}
        {activeTab === 'borrowers' && <BorrowersList token={token} />}
        {activeTab === 'loans' && <LoansList token={token} />}
      </div>
    </div>
  );
}

export default MainApp;