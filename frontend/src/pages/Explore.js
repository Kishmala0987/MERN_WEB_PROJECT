import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api,API_BASE_URL } from '../services/API_Service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // Add this import

const Explore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart(); // Add this

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(filters).toString();
        const response = await api.getProducts(queryParams);
        
        setProducts(response.products);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]); // Only depends on filters now

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          message: 'Please login as a customer to add items to cart',
          returnUrl: '/explore'
        } 
      });
      return;
    }

    if (user?.userType !== 'customer') {
      alert('Only customers can add items to cart');
      return;
    }

    try {
      await addToCart(product, 1);
      setIsCartOpen(true); // Open cart sidebar when item is added
    } catch (error) {
      alert(error.message);
    }
  };

  const ProductCard = ({ product }) => {
    const getImageUrl = (photoUrl) => {
      if (!photoUrl) return '/placeholder-image.jpg';
      if (photoUrl.startsWith('http')) return photoUrl;
      return `${API_BASE_URL}/uploads/${photoUrl}`;
    };

    return (
      <div 
        onClick={() => navigate(`/product/${product._id}`)}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      >
        <div className="relative pb-[100%]">
          {product.photos && product.photos.length > 0 ? (
            <img
              src={getImageUrl(product.photos[0])}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-indigo-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              by {product.seller?.shopName || 'Unknown Seller'}
            </span>
          </div>
          
          {/* Show stock information */}
          <p className="text-sm text-gray-500 mt-2">
            {product.quantity > 0 
              ? `${product.quantity} items available` 
              : 'Out of stock'}
          </p>
          
          {/* Add to Cart button - only show for non-sellers and if stock available */}
          {(!isAuthenticated || user?.userType !== 'seller') && (
            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.quantity === 0}
              className={`mt-4 w-full px-4 py-2 rounded-md transition-colors duration-200
                ${product.quantity > 0 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Explore Handcrafted Treasures
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-500">
            Discover unique handmade products from talented artisans around the world.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
            className="rounded-md border-gray-300"
          >
            <option value="">All Categories</option>
            <option value="Crafts">Crafts</option>
            <option value="handmade">Handmade</option>
            <option value="jewelry">Jewelry</option>
            <option value="artwork">Artwork</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value, page: 1})}
            className="rounded-md border-gray-300"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value, page: 1})}
              className="w-24 rounded-md border-gray-300"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value, page: 1})}
              className="w-24 rounded-md border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="group">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setFilters({...filters, page: i + 1})}
                    className={`px-4 py-2 rounded-md ${
                      filters.page === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;