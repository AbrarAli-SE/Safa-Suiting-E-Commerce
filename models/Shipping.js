const mongoose = require("mongoose");

const shippingSettingsSchema = new mongoose.Schema({
    shippingOption: { type: String, enum: ['free', 'rate'], default: 'free', required: true },
    shippingRate: { type: Number, default: 0, min: 0, required: true },
    taxRate: { type: Number, default: 0, min: 0, required: true },
}, { 
    timestamps: true,
});

module.exports = mongoose.model('ShippingSettings', shippingSettingsSchema);