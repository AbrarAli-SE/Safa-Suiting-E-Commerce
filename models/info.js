const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
    phoneNumber: { // New field for phone number (used for contact or support)
        type: String,
        required: true,
    },
    customerEmail: { // New field for customer email
        type: String,
        required: true,
    },
    supportEmail: { // New field for support email
        type: String,
        required: true,
    },
    aboutUs:{
        type: String,
        required: true,
        minlength: [10, "Message must be at least 10 characters"],
    },city:{
        type: String,
        required: true,
        minlength: [3, "City must be at least 3 characters"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('contactInfo', contactInfoSchema);
