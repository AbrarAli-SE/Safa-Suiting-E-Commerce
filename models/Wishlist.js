const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ References User Model
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // ✅ References Product Model
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now, // ✅ Stores when the item was added
        },
      },
    ],
  },
  { timestamps: true } // ✅ Adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
