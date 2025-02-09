const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema(
    {
        images: {type:[String],required: true} // ✅ Array of image URLs
    },
    { timestamps: true } // ✅ Save createdAt & updatedAt
);

module.exports = mongoose.model("Carousel", carouselSchema);
