// models/couponModel.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  coupon_code: { type: String, required: true, unique: true },
  coupon_type: { 
      type: String, 
      enum: ['shipping_free', 'tax_free', 'half_rate'], 
      required: true 
  },
  discount_amount: String,
  min_order_value: Number,
  expiry_date: { type: Date, required: true },
  start_date: Date,
  usage_limit: Number,
  usage_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Coupon', couponSchema);