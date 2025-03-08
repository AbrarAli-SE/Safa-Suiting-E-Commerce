const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    billingInfo: {
        firstName: { type: String, required: true },
        streetAddress: { type: String, required: true },
        apartment: { type: String },
        townCity: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        emailAddress: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['cash'],
        default: 'cash'
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);