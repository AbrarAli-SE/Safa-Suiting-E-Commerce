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
      min: 1, // ✅ Ensure at least 1 item in stock
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Flash Sales",
        "New Arrival",
        "Explore our Products",
        "Best Selling Products",
      ],
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // ✅ Cloudinary URL for product image
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
