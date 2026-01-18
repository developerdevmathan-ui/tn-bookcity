import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [lang, setLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToCart, cart } = useCart();

  // Fetch books whenever language changes
  useEffect(() => {
    setIsLoading(true);
    api.get(`/books?lang=${lang}`)
      .then(response => {
        setBooks(response.data.data);
        setError('');
      })
      .catch(err => {
        console.error("Error fetching books:", err);
        setError('Failed to load books. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, [lang]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-10 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">TN BookStore 📚</h1>
          
          <div className="flex items-center gap-6">
            {/* Language Selector */}
            <select 
              className="p-2 border rounded shadow-sm hover:border-blue-500 transition"
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>

            {/* Cart Link */}
            <Link 
              to="/cart" 
              className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition font-bold flex items-center gap-2"
            >
              🛒 Cart ({cart.length})
            </Link>

            {/* Admin Login */}
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition font-bold"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-10">
        <div className="max-w-6xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-6 border border-red-300">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <div className="text-center">
                <div className="text-gray-600 text-lg mb-4">Loading books...</div>
                <div className="inline-block animate-spin">⏳</div>
              </div>
            </div>
          ) : (
            <>
              {/* Books Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  {lang === 'en' ? 'Featured Books' : 'சிறப்பு புத்தகங்கள்'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {lang === 'en' 
                    ? `Showing ${books.length} book${books.length !== 1 ? 's' : ''}`
                    : `${books.length} புத்தகங்களைக் காட்டுகிறது`
                  }
                </p>
              </div>

              {/* Books Grid */}
              {books.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <div 
                      key={book.id} 
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 flex flex-col justify-between"
                    >
                      {/* Book Info */}
                      <div className="mb-4">
                        <h2 className="font-bold text-xl text-gray-800 mb-2">{book.title}</h2>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {book.description || 'No description available'}
                        </p>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-4">
                        {book.in_stock ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-bold">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Price & Button */}
                      <div className="flex justify-between items-center border-t pt-4">
                        <span className="font-bold text-green-700 text-lg">₹{book.price}</span>
                        <button 
                          onClick={() => addToCart(book)}
                          disabled={!book.in_stock}
                          className={`px-4 py-2 rounded text-sm font-bold transition ${
                            book.in_stock
                              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {book.in_stock ? 'Add to Cart' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                  <p className="text-gray-600 text-lg">
                    {lang === 'en' 
                      ? 'No books available at the moment.'
                      : 'இப்போது புத்தகங்கள் கிடைக்கவில்லை.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}