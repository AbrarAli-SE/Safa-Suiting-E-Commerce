const express = require("express");
const router = express.Router();
const Carousel = require("../models/Carousel"); // ✅ Import Carousel Model

router.get('/', async (req, res, next) => {
    try {
        const carousel = await Carousel.findOne(); // ✅ Fetch images from DB
        res.render('index', { carouselImages: carousel ? carousel.images : [] });
    } catch (error) {
        console.error("❌ Index Page Error:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
