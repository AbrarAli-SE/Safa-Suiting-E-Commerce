// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        img: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }],
    totalPrice: { type: Number, default: 0 }, // Subtotal before tax/shipping/discount
    discount: { type: Number, default: 0 },   // Discount from coupon
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    finalTotal: { type: Number, default: 0 }  // Total after tax/shipping/discount
});

module.exports = mongoose.model('Cart', cartSchema);