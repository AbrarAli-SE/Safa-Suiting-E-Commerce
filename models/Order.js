const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  billingInfo: {
    firstName: String,
    streetAddress: String,
    apartment: String,
    townCity: String,
    phoneNumber: String,
    emailAddress: String
  },
  paymentMethod: String,
  subtotal: Number,
  shipping: Number,
  tax: Number,
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ['pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'pending' 
  },
  trackingId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);