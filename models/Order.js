const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: false // Optional if guest checkout is allowed
  },
  billingDetails: {
    firstName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    apartment: { type: String },
    townCity: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    saveInfo: { type: Boolean, default: false }
  },
  cart: [{
    product: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true }
    },
    quantity: { type: Number, default: 1 }
  }],
  paymentMethod: {
    type: String,
    enum: ['easypaisa', 'cash'],
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);