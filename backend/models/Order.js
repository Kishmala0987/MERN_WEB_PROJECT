const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {  // renamed from user to be more specific
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    seller: {  // Add seller reference
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    status: {  // Add per-item status
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  }],
  total: {
    type: Number,
    required: true
  },
}, {
  timestamps: true  // Replace createdAt with automatic timestamps
});

// Add index for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1, createdAt: -1 });

// Add this method to orderSchema before creating the model
orderSchema.methods.canCancel = function() {
  // Check if all items in the order are in 'pending' status
  return this.items.every(item => item.status === 'pending');
};

orderSchema.statics.findAndCancel = async function(orderId, customerId) {
  const order = await this.findOne({ _id: orderId, customer: customerId });
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (!order.canCancel()) {
    throw new Error('Order cannot be cancelled');
  }

  // Update the status of all items to 'cancelled'
  order.items.forEach(item => item.status = 'cancelled');
  await order.save();
  
  return order;
}

module.exports = mongoose.model('Order', orderSchema);