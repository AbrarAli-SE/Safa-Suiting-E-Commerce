const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: 0, // If no discount, keep it 0
    },
    quantity: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true, // ✅ Allow any category, including custom ones, and trim whitespace
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, 
      required: true,
    },
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ], // ✅ Search Optimization
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);