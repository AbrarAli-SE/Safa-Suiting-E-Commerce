// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, default: function() { return this.email; } },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  otp: { type: String },
  verified: { type: Boolean, default: false },
});
module.exports = mongoose.model('User', userSchema);
