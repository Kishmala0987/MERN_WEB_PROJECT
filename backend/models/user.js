const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: String,
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Already registered' ]
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
    
  userType: {
    type: String,
    enum: {
      values: ['customer', 'seller', 'admin'],
      message: 'Please select correct user type'
    },
    default: 'customer'
  },
   // Seller specific fields
  shopName: {
    type: String,
    trim: true,
    required: function() {
      return this.userType === 'seller';
    }
  },
   businessAddress: {
    type: String,
    trim: true,
    required: function() {
      return this.userType === 'seller';
    }
  },
  //personalizing favorites for users
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product',
  }],
});
module.exports = mongoose.model('User', userSchema)