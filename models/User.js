// const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      default: function () {
        return this.email.split('@')[0]; // Extracts username from email
      },
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
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

module.exports = mongoose.model('User', userSchema);
