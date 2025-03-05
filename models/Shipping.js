const mongoose = require("mongoose");

const shippingSettingsSchema = new mongoose.Schema({
    shippingOption: { type: String, enum: ['free', 'rate'], default: 'free', required: true },
    shippingRate: { type: Number, default: 0, min: 0, required: true },
    taxRate: { type: Number, default: 0, min: 0, required: true },
}, { 
    timestamps: true,
    collection: 'ShippingSettings' // Explicitly specify the collection name
});

module.exports = mongoose.model('ShippingSettings', shippingSettingsSchema);