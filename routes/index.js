const express = require("express");
const router = express.Router();
const Carousel = require("../models/Carousel"); // Ensure this is the correct path to your Carousel model
const Product = require("../models/Product"); // Ensure this is the correct path to your Product model
const { authenticateUser } = require("../middleware/authMiddleware");




router.get('/',authenticateUser ,async (req, res, next) => {
    try {
        // Fetch all unique categories from the products collection
        let categories = await Product.distinct("category");

        // Ensure "Flash Sales" is at the forefront
        categories = categories.filter(cat => cat !== "Flash Sales");
        categories.unshift("Flash Sales"); // Add "Flash Sales" as the first element

        // Prepare a map of promises to fetch products for each category
        const categoryPromises = categories.map(category => 
            Product.find({ category: category })
        );

        // Resolve all promises to get products organized by categories
        const categoryProducts = await Promise.all(categoryPromises);

        // Combine categories with their products
        const categorizedProducts = categories.reduce((acc, cur, idx) => {
            acc[cur] = categoryProducts[idx]; // Maps each category to its products
            return acc;
        }, {});

        const carousel = await Carousel.findOne(); // Fetch images from DB
        res.render('index', {
            carouselImages: carousel ? carousel.images : [],
            categorizedProducts,
            user: req.user // Add user-specific data to the render
        });
    } catch (error) {
        console.error("❌ Index Page Error:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
