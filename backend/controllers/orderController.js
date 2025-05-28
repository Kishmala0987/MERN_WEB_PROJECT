const Order = require('../models/order');
const Product = require('../models/product');

exports.getOrders = async (req, res) => {
  try {
    let orders;
    
    if (req.user.userType === 'seller') {
      // Fetch orders containing products sold by this seller
      orders = await Order.find({
        'items.seller': req.user._id
      })
      .populate('customer', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

      // Filter items in each order to only show seller's items
      orders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(item => 
          item.seller.toString() === req.user._id.toString()
        )
      }));
    } else {
      // Fetch orders placed by the customer
      orders = await Order.find({ 
        customer: req.user._id 
      })
      .populate('items.product')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const customerId = req.user._id;

    await Order.findAndCancel(orderId, customerId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(error.message.includes('Order not found') ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to cancel order'
    });
  }
};