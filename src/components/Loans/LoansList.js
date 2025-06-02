import React, { useState, useEffect } from 'react';

function LoansList({ token }) {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]); // For dropdown of available books
  const [borrowers, setBorrowers] = useState([]); // For dropdown of borrowers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for adding a loan
  const [newLoan, setNewLoan] = useState({
    bookId: '',
    borrowerId: '',
  });
  const [formError, setFormError] = useState('');

  const API_BASE_URL = 'https://localhost:7086'; // Your backend API URL

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch loans
      const loansResponse = await fetch(`${API_BASE_URL}/api/Loans`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!loansResponse.ok) throw new Error(`HTTP error! status: ${loansResponse.status} for loans`);
      const loansData = await loansResponse.json();
      setLoans(loansData);

      // Fetch available books
      const booksResponse = await fetch(`${API_BASE_URL}/api/Books`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!booksResponse.ok) throw new Error(`HTTP error! status: ${booksResponse.status} for books`);
      const booksData = await booksResponse.json();
      // Filter for available books only for new loans
      setBooks(booksData.filter(book => book.isAvailable));

      // Fetch borrowers
      const borrowersResponse = await fetch(`${API_BASE_URL}/api/Borrowers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!borrowersResponse.ok) throw new Error(`HTTP error! status: ${borrowersResponse.status} for borrowers`);
      const borrowersData = await borrowersResponse.json();
      setBorrowers(borrowersData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please ensure the backend is running and you are authorized.");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newLoan.bookId || !newLoan.borrowerId) {
      setFormError('Please select a book and a borrower.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Loans/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: parseInt(newLoan.bookId),
          borrowerId: parseInt(newLoan.borrowerId),
          loanDate: new Date().toISOString(), // Current date/time
        }),
      });

      if (response.ok) {
        setNewLoan({ bookId: '', borrowerId: '' }); // Clear form
        fetchAllData(); // Refresh all data
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to borrow book. Book might be unavailable or borrower not found.');
      }
    } catch (err) {
      console.error("Error borrowing book:", err);
      setFormError("Network error or server unreachable.");
    }
  };

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('Are you sure you want to mark this book as returned?')) {
      return;
    }

    try {
      const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/Loans/return/</span>{loanId}`, {
        method: 'PUT', // or PATCH depending on API design, but PUT is common for idempotent updates
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAllData(); // Refresh all data
      } else {
        setError('Failed to return book.');
      }
    } catch (err) {
      console.error("Error returning book:", err);
      setError("Network error or server unreachable.");
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) {
      return;
    }

    try {
      const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/Loans/</span>{id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAllData(); // Refresh all data
      } else {
        setError('Failed to delete loan record.');
      }
    } catch (err) {
      console.error("Error deleting loan:", err);
      setError("Network error or server unreachable.");
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <p>Loading loans data...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="loans-section">
      <h2>Loans Management</h2>

      <div className="add-section">
        <h3>Borrow New Book</h3>
        <form onSubmit={handleBorrowBook} className="add-form">
          <div className="form-group">
            <label htmlFor="bookSelect">Select Book:</label>
            <select
              id="bookSelect"
              value={newLoan.bookId}
              onChange={(e) => setNewLoan({ ...newLoan, bookId: e.target.value })}
              required
            >
              <option value="">-- Select an available book --</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author} (ISBN: {book.isbn})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="borrowerSelect">Select Borrower:</label>
            <select
              id="borrowerSelect"
              value={newLoan.borrowerId}
              onChange={(e) => setNewLoan({ ...newLoan, borrowerId: e.target.value })}
              required
            >
              <option value="">-- Select a borrower --</option>
              {borrowers.map((borrower) => (
                <option key={borrower.id} value={borrower.id}>
                  {borrower.name} ({borrower.contactInfo})
                </option>
              ))}
            </select>
          </div>
          {formError && <p className="error-message" style={{ width: '100%', textAlign: 'center' }}>{formError}</p>}
          <button type="submit" className="btn">Borrow Book</button>
        </form>
      </div>


      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Book Title</th>
            <th>Borrower Name</th>
            <th>Loan Date</th>
            <th>Return Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>{loan.book?.title || 'N/A'}</td> {/* Use optional chaining */}
              <td>{loan.borrower?.name || 'N/A'}</td> {/* Use optional chaining */}
              <td>{formatDate(loan.loanDate)}</td>
              <td>{formatDate(loan.returnDate)}</td>
              <td>{loan.returnDate ? 'Returned' : 'Active'}</td>
              <td className="action-buttons">
                {!loan.returnDate && (
                  <button className="edit-btn" onClick={() => handleReturnBook(loan.id)}>Return</button>
                )}
                <button className="delete-btn" onClick={() => handleDeleteLoan(loan.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LoansList;