const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.checkout = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }

    // Process order
    const orderItems = [];
    let totalAmount = 0;

    // Group items by seller
    const itemsBySeller = items.reduce((acc, item) => {
      const sellerId = item.product.seller;
      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push(item);
      return acc;
    }, {});

    // Validate stock and create order items
    for (const item of items) {
      const product = await Product.findById(item.product._id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product._id} not found`
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} units available for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        seller: product.seller,
        quantity: item.quantity,
        price: product.price,
        status: 'pending'
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order with all required fields
    const order = new Order({
      customer: userId,
      items: orderItems,
      total: totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash', // Or get from request body if implemented
      shippingAddress: {
        // Get from user profile or request body
        street: req.user.address?.street || '',
        city: req.user.address?.city || '',
        state: req.user.address?.state || '',
        zipCode: req.user.address?.zipCode || '',
        country: req.user.address?.country || ''
      }
    });

    // Use transaction to ensure data consistency
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Update product quantities
        for (const item of orderItems) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { quantity: -item.quantity } },
            { session }
          );
        }
        // Save the order
        await order.save({ session });
      });

      await session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Order placed successfully',
        order: {
          id: order._id,
          total: order.total,
          status: order.status
        }
      });
    } catch (error) {
      await session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process checkout',
      error: error.message
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      product
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      items: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart items',
      error: error.message
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    res.status(200).json({
      success: true,
      message: 'Cart quantity updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update cart quantity',
      error: error.message
    });
  }
};