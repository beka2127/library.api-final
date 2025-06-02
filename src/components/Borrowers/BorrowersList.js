import React, { useState, useEffect } from 'react';

function BorrowersList({ token }) {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newBorrower, setNewBorrower] = useState({
    id: 0,
    name: '',
    contactInfo: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');

  const API_BASE_URL = 'https://localhost:7086'; // Your backend API URL

  useEffect(() => {
    fetchBorrowers();
  }, [token]);

  const fetchBorrowers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Borrowers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBorrowers(data);
    } catch (err) {
      console.error("Error fetching borrowers:", err);
      setError("Failed to fetch borrowers. Please ensure the backend is running and you are authorized.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateBorrower = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newBorrower.name || !newBorrower.contactInfo) {
      setFormError('Name and Contact Info are required.');
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `<span class="math-inline">\{API\_BASE\_URL\}/api/Borrowers/</span>{newBorrower.id}` : `${API_BASE_URL}/api/Borrowers`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newBorrower),
      });

      if (response.ok) {
        setNewBorrower({ id: 0, name: '', contactInfo: '' });
        setIsEditing(false);
        fetchBorrowers();
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to save borrower.');
      }
    } catch (err) {
      console.error("Error saving borrower:", err);
      setFormError("Network error or server unreachable.");
    }
  };

  const handleEditClick = (borrower) => {
    setNewBorrower({ ...borrower });
    setIsEditing(true);
    setFormError('');
  };

  const handleDeleteBorrower = async (id) => {
    if (!window.confirm('Are you sure you want to delete this borrower?')) {
      return;
    }

    try {
      const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/Borrowers/</span>{id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBorrowers();
      } else {
        setError('Failed to delete borrower.');
      }
    } catch (err) {
      console.error("Error deleting borrower:", err);
      setError("Network error or server unreachable.");
    }
  };

  if (loading) return <p>Loading borrowers...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="borrowers-section">
      <h2>Borrowers Management</h2>

      <div className="add-section">
        <h3>{isEditing ? 'Edit Borrower' : 'Add New Borrower'}</h3>
        <form onSubmit={handleAddOrUpdateBorrower} className="add-form">
          <div className="form-group">
            <label htmlFor="borrower-name">Name:</label>
            <input
              type="text"
              id="borrower-name"
              value={newBorrower.name}
              onChange={(e) => setNewBorrower({ ...newBorrower, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactInfo">Contact Info (Email):</label>
            <input
              type="email"
              id="contactInfo"
              value={newBorrower.contactInfo}
              onChange={(e) => setNewBorrower({ ...newBorrower, contactInfo: e.target.value })}
              required
            />
          </div>
          {formError && <p className="error-message" style={{ width: '100%', textAlign: 'center' }}>{formError}</p>}
          <button type="submit" className="btn">{isEditing ? 'Update Borrower' : 'Add Borrower'}</button>
          {isEditing && (
            <button type="button" className="btn" style={{ backgroundColor: '#6c757d', marginLeft: '10px' }} onClick={() => {
              setIsEditing(false);
              setNewBorrower({ id: 0, name: '', contactInfo: '' });
              setFormError('');
            }}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {borrowers.map((borrower) => (
            <tr key={borrower.id}>
              <td>{borrower.id}</td>
              <td>{borrower.name}</td>
              <td>{borrower.contactInfo}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => handleEditClick(borrower)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDeleteBorrower(borrower.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BorrowersList;