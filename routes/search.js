const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Make sure this path is correct

// GET /api/search for live search suggestions
router.get("/api/search", async (req, res) => {
    try {
        const searchQuery = req.query.q.trim();
        if (!searchQuery) return res.json([]); // Return empty array if query is empty

        const regex = new RegExp(searchQuery, 'i'); // Case insensitive search
        const results = await Product.find({
            $or: [
                { name: { $regex: regex } },
                { keywords: { $regex: regex } }
            ]
        }).limit(12);

        res.json(results);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).send("Error processing search request");
    }
});

// GET /searchResults to show individual product details from search
router.get('/searchResults', async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).render('error-page', { message: "No product ID provided." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render('error-page', { message: "Product not found." });
        }

        // Fetch suggestions (related products) based on category or other criteria
        const suggestions = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id } // Exclude the current product
        }).limit(7);

        // Render the search results page with product details and suggestions
        res.render('searchResults', { product, searchQuery: product.name, suggestions });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('error-page', { message: "Error processing search request" });
    }
});


module.exports = router;
