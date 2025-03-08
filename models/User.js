const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true, // Changed to false to support Google OAuth users
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: null, // Updated when user logs in or performs actions
    },
    billingInfo: {
      firstName: { type: String },
      streetAddress: { type: String },
      apartment: { type: String },
      townCity: { type: String },
      phoneNumber: { type: String },
      emailAddress: { type: String }
    }
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

module.exports = mongoose.model('User', userSchema);