const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        img: String,
        price: Number,
        quantity: Number
    }],
    totalPrice: Number,
    discount: Number,
    finalTotal: Number,
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    appliedCouponCode: String
});
module.exports = mongoose.model('Cart', cartSchema);