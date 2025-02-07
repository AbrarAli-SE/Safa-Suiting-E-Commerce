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
      required: true,
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
      type: Date, // OTP expiration time
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    tokens: [{ token: { type: String } }],  // ✅ Store active JWTs
    
     // ✅ Wishlist Feature: Store array of Product IDs
     wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to Product model
      }
    ]
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

module.exports = mongoose.model('User', userSchema);
