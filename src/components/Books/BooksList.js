import React, { useState, useEffect } from 'react';

function BooksList({ token }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for adding/editing a book
  const [newBook, setNewBook] = useState({
    id: 0,
    title: '',
    author: '',
    isbn: '',
    publicationYear: '',
    genre: '',
    isAvailable: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');

  const API_BASE_URL = 'https://localhost:7086'; // Your backend API URL - Make sure this is correct!

  useEffect(() => {
    fetchBooks();
    addDefaultBooksOnce(); // Call the function to add default books
  }, [token]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Books`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to fetch books. Please ensure the backend is running and you are authorized.");
    } finally {
      setLoading(false);
    }
  };

  // Function to add default books if they don't exist
  const addDefaultBooksOnce = async () => {
    const defaultBooks = [
      {
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        isbn: "9780345391803",
        publicationYear: 1979,
        genre: "Science Fiction",
        isAvailable: true
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "9780141439518",
        publicationYear: 1813,
        genre: "Romance",
        isAvailable: true
      }
    ];

    try {
      // Fetch current books to avoid duplicates
      const response = await fetch(`${API_BASE_URL}/api/Books`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} during default book check`);
      }
      const currentBooks = await response.json();

      for (const book of defaultBooks) {
        // Check if book already exists to prevent adding duplicates on every load
        const exists = currentBooks.some(
          (b) => b.title === book.title && b.author === book.author
        );

        if (!exists) {
          console.log(`Adding default book: ${book.title}`);
          const addResponse = await fetch(`${API_BASE_URL}/api/Books`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(book),
          });

          if (!addResponse.ok) {
            const errorText = await addResponse.text();
            console.error(`Failed to add default book ${book.title}:`, errorText);
            // Optionally, you could set a specific error message for the user here
          }
        }
      }
      fetchBooks(); // Re-fetch all books after attempting to add defaults
    } catch (err) {
      console.error("Error adding default books:", err);
      // Not critical to block the UI, but log for debugging
    }
  };

  const handleAddOrUpdateBook = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!newBook.title || !newBook.author || !newBook.publicationYear || !newBook.isbn) {
      setFormError('Title, Author, ISBN, and Publication Year are required.');
      return;
    }
    // ISBN length validation (client-side)
    if (newBook.isbn.length < 10 || newBook.isbn.length > 13) {
      setFormError('ISBN must be between 10 and 13 characters.');
      return;
    }


    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_BASE_URL}/api/Books/${newBook.id}` : `${API_BASE_URL}/api/Books`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newBook,
          publicationYear: parseInt(newBook.publicationYear), // Ensure year is int
        }),
      });

      if (response.ok) {
        setNewBook({ id: 0, title: '', author: '', isbn: '', publicationYear: '', genre: '', isAvailable: true });
        setIsEditing(false);
        fetchBooks(); // Refresh list
      } else {
        const errorData = await response.json();
        // Display backend validation errors if available
        if (errorData.errors) {
            const validationMessages = Object.values(errorData.errors).flat().join('; ');
            setFormError(`Validation Error: ${validationMessages}`);
        } else {
            setFormError(errorData.message || 'Failed to save book.');
        }
      }
    } catch (err) {
      console.error("Error saving book:", err);
      setFormError("Network error or server unreachable.");
    }
  };

  const handleEditClick = (book) => {
    setNewBook({ ...book }); // Populate form with book data
    setIsEditing(true);
    setFormError('');
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBooks(); // Refresh list
      } else {
        setError('Failed to delete book.');
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      setError("Network error or server unreachable.");
    }
  };

  if (loading) return <p>Loading books...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="books-section">
      <h2>Books Management</h2>

      <div className="add-section">
        <h3>{isEditing ? 'Edit Book' : 'Add New Book'}</h3>
        <form onSubmit={handleAddOrUpdateBook} className="add-form">
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="author">Author:</label>
            <input
              type="text"
              id="author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="isbn">ISBN:</label>
            <input
              type="text"
              id="isbn"
              value={newBook.isbn}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="publicationYear">Pub. Year:</label>
            <input
              type="number"
              id="publicationYear"
              value={newBook.publicationYear}
              onChange={(e) => setNewBook({ ...newBook, publicationYear: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="genre">Genre:</label>
            <input
              type="text"
              id="genre"
              value={newBook.genre}
              onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isAvailable"
              checked={newBook.isAvailable}
              onChange={(e) => setNewBook({ ...newBook, isAvailable: e.target.checked })}
              style={{ marginRight: '5px', width: 'auto' }}
            />
            <label htmlFor="isAvailable" style={{ margin: '0' }}>Available</label>
          </div>
          {formError && <p className="error-message" style={{ width: '100%', textAlign: 'center' }}>{formError}</p>}
          <button type="submit" className="btn">{isEditing ? 'Update Book' : 'Add Book'}</button>
          {isEditing && (
            <button type="button" className="btn" style={{ backgroundColor: '#6c757d', marginLeft: '10px' }} onClick={() => {
              setIsEditing(false);
              setNewBook({ id: 0, title: '', author: '', isbn: '', publicationYear: '', genre: '', isAvailable: true });
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
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn}</td>
              <td>{book.publicationYear}</td>
              <td>{book.genre}</td>
              <td>{book.isAvailable ? 'Yes' : 'No'}</td>
              <td className="action-buttons">
                <button className="edit-btn" onClick={() => handleEditClick(book)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDeleteBook(book.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BooksList;