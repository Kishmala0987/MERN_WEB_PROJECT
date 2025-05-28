import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/API_Service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems, toggleCart } = useCart();

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      navigate('/login', { 
        state: { message: 'You have been successfully logged out.' }
      });
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CraftsMarket
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/explore" 
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
              Explore
            </Link>
            <Link 
              to="/sellers" 
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
              Sellers
            </Link>
            
            {/* Add Orders link for customers */}
            {isAuthenticated && user?.userType === 'customer' && (
              <Link 
                to="/orders" 
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
              >
                Orders
              </Link>
            )}
            
            {/* Seller-specific navigation */}
            {isAuthenticated && user?.userType === 'seller' && (
              <>
                <Link 
                  to="/seller/products" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  My Products
                </Link>
                <Link 
                  to="/seller/orders" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  Orders
                </Link>
                <Link 
                  to="/seller/product/upload" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  + Add Product
                </Link>
              </>
            )}
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right side icons and actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User/Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">{user?.firstName}</span>
                
                {/* Cart Button - Only show for customers */}
                {user?.userType === 'customer' && (
                  <button
                    onClick={toggleCart}
                    className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;