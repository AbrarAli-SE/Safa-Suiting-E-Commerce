const express = require("express");
const router = express.Router();
const Carousel = require("../models/Carousel");
const Product = require("../models/Product");
const { authenticateUser } = require("../middleware/authMiddleware");

router.get('/', authenticateUser, async (req, res, next) => {
  try {
    // Fetch all unique categories from the products collection
    let categories = await Product.distinct("category");

    // Ensure "Flash Sales" is at the forefront
    categories = categories.filter(cat => cat !== "Flash Sales");
    categories.unshift("Flash Sales");

    // Prepare a map of promises to fetch products for each category, sorted by createdAt descending
    const categoryPromises = categories.map(category => 
      Product.find({ category: category })
        .sort({ createdAt: -1 }) // ✅ Sort newest first
    );

    // Resolve all promises to get products organized by categories
    const categoryProducts = await Promise.all(categoryPromises);

    // Combine categories with their products
    const categorizedProducts = categories.reduce((acc, cur, idx) => {
      acc[cur] = categoryProducts[idx];
      return acc;
    }, {});

    const carousel = await Carousel.findOne();
    res.render('index', {
      carouselSlides: carousel ? carousel.slides : [],
      categorizedProducts,
      user: req.user,
    });
  } catch (error) {
    console.error("❌ Index Page Error:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;