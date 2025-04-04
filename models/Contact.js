const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true,
        minlength: [10, "Message must be at least 10 characters"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isNotified: 
    { 
        type: Boolean, 
        default: false 
    } // ✅ New Field for Notification

});

module.exports = mongoose.model('Contact',contactSchema);