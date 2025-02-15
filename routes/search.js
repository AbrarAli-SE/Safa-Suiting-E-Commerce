const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get("/", async (req, res) => {
    const searchQuery = req.query.q ? req.query.q.trim() : '';

    if (!searchQuery) {
        res.render('search', { results: [], searchQuery: '' }); // Render page with no results
        return;
    }

    const regex = new RegExp(searchQuery, 'i');
    try {
        const results = await Product.find({
            $or: [
                { name: { $regex: regex } },
                { keywords: { $regex: regex } }
            ]
        }).limit(12);

        if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
            // This is an AJAX request, return JSON
            res.json(results);
        } else {
            // This is a direct access, render the results page
            res.render('search', { results, searchQuery });
        }
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).send("Error processing search request");
    }
});

module.exports = router;
