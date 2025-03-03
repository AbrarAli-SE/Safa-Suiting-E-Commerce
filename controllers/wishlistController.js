const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;

    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to add items to your wishlist." });
    }

    try {
        // Update lastActive for authenticated user
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Find the user's wishlist
        let wishlist = await Wishlist.findOne({ user: req.user.userId });

        // If the wishlist does not exist, create a new one
        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user.userId,
                items: []
            });
        }

        // Check if the product is already in the wishlist
        const existingItemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex !== -1) {
            return res.json({ success: true, message: "Product is already in wishlist.", wishlist });
        } else {
            wishlist.items.push({
                product: product._id,
            });
            await wishlist.save();
            return res.json({ success: true, message: "Product added to wishlist.", wishlist });
        }
    } catch (error) {
        console.error("❌ Add to Wishlist Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Try again." });
    }
};



exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.body;

    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to remove items from your wishlist." });
    }

    try {
        // Update lastActive for authenticated user
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Find the wishlist
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: "Wishlist not found." });
        }

        // Find the index of the item to remove
        const itemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found in wishlist." });
        }

        // Remove the item from the wishlist
        wishlist.items.splice(itemIndex, 1);
        await wishlist.save();

        return res.json({ success: true, message: "Product removed from wishlist.", wishlist });

    } catch (error) {
        console.error("❌ Remove from Wishlist Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Try again." });
    }
};

exports.renderWishlist = async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).render("auth/login", { error: "Please log in to view your wishlist." });
    }

    try {
        // Find the wishlist with populated product details
        const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate('items.product');

        // If the wishlist does not exist or is empty
        if (!wishlist || wishlist.items.length === 0) {
            return res.render("user/wishlist", { 
                user: req.user,
                wishlist: [] 
            });
        }

        // Render the wishlist page with data
        return res.render("user/wishlist", { 
            user: req.user,
            wishlist: wishlist.items 
        });

    } catch (error) {
        console.error("❌ Render Wishlist Error:", error);
        return res.status(500).render("user/wishlist", { 
            user: req.user,
            wishlist: [], 
            errorMessage: "Server error. Try again." 
        });
    }
};