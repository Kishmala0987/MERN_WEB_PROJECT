import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/API_Service';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [tempCartItems, setTempCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      if (!isAuthenticated || user?.userType !== 'customer') {
        throw new Error('Only customers can add items to cart');
      }

      // Check if quantity is valid
      if (quantity > product.quantity) {
        throw new Error(`Only ${product.quantity} items available`);
      }

      // Check if adding would exceed stock
      const existingItem = tempCartItems.find(item => item.product._id === product._id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantity) {
          throw new Error(`Cannot add more than ${product.quantity} items`);
        }
      }

      // Update cart
      setTempCartItems(prev => {
        const existingItemIndex = prev.findIndex(item => item.product._id === product._id);
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...prev];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          return updatedItems;
        }

        return [...prev, { 
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            photos: product.photos,
            seller: product.seller,
            quantity: product.quantity // Store available quantity
          }, 
          quantity 
        }];
      });

      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  }, [isAuthenticated, user, tempCartItems]);

  const removeFromCart = useCallback((productId) => {
    setTempCartItems(prev => prev.filter(item => item.product._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    setTempCartItems(prev => {
      const item = prev.find(item => item.product._id === productId);
      if (!item) return prev;

      if (newQuantity > item.product.quantity) {
        throw new Error(`Only ${item.product.quantity} items available`);
      }

      if (newQuantity < 1) {
        return prev.filter(item => item.product._id !== productId);
      }

      return prev.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  }, []);

  const checkout = useCallback(async () => {
    try {
      if (!isAuthenticated || user?.userType !== 'customer') {
        throw new Error('Only customers can checkout');
      }

      if (tempCartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      setCheckoutLoading(true);

      // Format cart items for the API
      const formattedItems = tempCartItems.map(item => ({
        product: {
          _id: item.product._id,
          seller: item.product.seller,
          price: item.product.price
        },
        quantity: item.quantity,
        price: item.product.price // Include price at checkout time
      }));

      const response = await api.checkout({ 
        items: formattedItems,
        shippingAddress: user.address, // Include shipping address
        paymentMethod: 'cash' // Default payment method, can be made dynamic
      });
      
      if (response.success) {
        setTempCartItems([]);
        setIsCartOpen(false);
        return {
          success: true,
          orderId: response.order.id,
          message: 'Order placed successfully'
        };
      } else {
        throw new Error(response.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process checkout'
      };
    } finally {
      setCheckoutLoading(false);
    }
  }, [tempCartItems, isAuthenticated, user]);

  const validateCartItems = useCallback(() => {
    return tempCartItems.every(item => 
      item.quantity <= item.product.quantity && 
      item.quantity > 0
    );
  }, [tempCartItems]);

  const getCartSummary = useCallback(() => {
    const total = tempCartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    const itemCount = tempCartItems.reduce((sum, item) => 
      sum + item.quantity, 0
    );

    return {
      total,
      itemCount,
      isValid: validateCartItems()
    };
  }, [tempCartItems, validateCartItems]);

  return (
    <CartContext.Provider value={{
      cartItems: tempCartItems,
      isCartOpen,
      checkoutLoading,
      setIsCartOpen,
      toggleCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      checkout,
      getCartSummary,
      validateCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};