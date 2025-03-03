const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to User model
        required: false,
    },
    guestId: { type: String, required: false },
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
            quantity: {
                type: Number,
                required: true,
                min: 1, // Ensure quantity is at least 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        default: 0,
    },
  }, { timestamps: true });
  
  module.exports = mongoose.model("Cart", cartSchema);
  