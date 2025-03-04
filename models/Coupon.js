// models/couponModel.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  coupon_code: { type: String, required: true, unique: true },
  coupon_name: { type: String, required: true },
  coupon_type: { 
    type: String, 
    enum: ['shipping_free', 'tax_free', 'half_rate'], 
    required: true 
  },
  discount_amount: { type: String, required: true },
  min_order_value: { type: Number },
  expiry_date: { type: Date, required: true },
  start_date: { type: Date },
  usage_limit: { type: Number },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', couponSchema);