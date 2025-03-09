const mongoose = require('mongoose');

const cancelledOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
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
    cancelledAt: {
        type: Date,
        default: Date.now
    },
    originalCreatedAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CancelledOrder', cancelledOrderSchema);