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
    replyStatus: { type: String, default: 'Pending', enum: ['Pending', 'replied'] },
    replyMessage: { type: String },
    replyDate: { type: Date },

});

module.exports = mongoose.model('Contact',contactSchema);