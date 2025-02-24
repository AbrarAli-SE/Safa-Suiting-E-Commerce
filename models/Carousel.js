const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carouselSchema = new Schema({
  slides: [{
    image: { type: String, required: true }, // Image URL
    text: { type: String, default: "" }, // Optional text
    font: { type: String, default: "Arial" }, // Font family
    fontSize: { type: Number, default: 24 }, // Font size in pixels
    color: { type: String, default: "#FFFFFF" }, // Text color (hex)
    opacity: { type: Number, default: 1.0, min: 0, max: 1 }, // Opacity (0-1)
  }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Carousel", carouselSchema);