const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to User model
      required: false, // Changed to false to support guest users
    },
    guestId: {
      type: String,
      required: false, // For guest users
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',  // Reference to Product model
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        img: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discountPrice: {
          type: Number,
          required: true,
        },
      }
    ]
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Wishlist", wishlistSchema);