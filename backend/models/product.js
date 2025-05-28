const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        unique: [true, 'Product name must be unique']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']

    },
    photos: [{
        type: String,
        required: true
    }],
    quantity: {
        type: Number,
        required: [true, 'Product quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    category: {
        type: String,
        enum:{
            values: ['Crafts', 'handmade', 'jewelry', 'artwork'],
            message: 'Please select correct category for the product'},
        default: 'Crafts',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'outOfStock', 'draft'],
        default: 'active'
    },
    Specifications: {
        type: String,
        default: ''
    } ,
    shippingInfo: {  
    type: String,
    default: ''
  }
});
module.exports = mongoose.model('Product', productSchema);

