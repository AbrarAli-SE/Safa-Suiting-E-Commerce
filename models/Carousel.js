const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carouselSchema = new Schema({
  slides: [{
    image: { type: String, required: true } // Only image URL
  }],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Carousel", carouselSchema);
