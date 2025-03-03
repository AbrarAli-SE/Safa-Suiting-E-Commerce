const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to User model
      required: true, // Changed to false to support guest users
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',  // Reference to Product model
          required: true,
        },
        
      }
    ]
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Wishlist", wishlistSchema);