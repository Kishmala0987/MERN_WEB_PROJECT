import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'react-feather';
import { API_BASE_URL } from '../services/API_Service';

const getImageUrl = (photoUrl) => {
  if (!photoUrl) return '/placeholder-image.jpg';
  if (photoUrl.startsWith('http')) return photoUrl;
  return `${API_BASE_URL}/uploads/${photoUrl}`;
};

const CartSidebar = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    checkout,
    checkoutLoading,
    validateCartItems,
  } = useCart();
  const { isAuthenticated, user } = useAuth();

  const handleCheckout = async () => {
    try {
      if (!isAuthenticated || user?.userType !== 'customer') {
        navigate('/login', { 
          state: { message: 'Please login as a customer to checkout' }
        });
        return;
      }

      const { success, message } = await checkout();
      
      if (success) {
        setIsCartOpen(false);
        navigate('/orders');
        alert('Order placed successfully!');
      } else {
        alert(message || 'Checkout failed');
      }
    } catch (error) {
      alert(error.message || 'Checkout failed');
    }
  };

  const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart(); // Keep these here where they're used

    return (
      <div className="flex py-4 border-b border-slate-200">
        <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(item.product.photos[0])}
            alt={item.product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-slate-900">{item.product.name}</h3>
          <p className="text-sm text-slate-600">${item.product.price.toFixed(2)}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                disabled={item.quantity >= item.product.quantity}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => removeFromCart(item.product._id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (!isAuthenticated || user?.userType !== 'customer') return null;

  return (
    <>
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-500">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.map(item => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${calculateCartTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !validateCartItems()}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {checkoutLoading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </>
  );
};

export default CartSidebar;