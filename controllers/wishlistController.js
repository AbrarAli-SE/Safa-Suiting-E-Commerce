const User = require("../models/User");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Add a product to the user's wishlist
exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;

    // Check if the user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to add items to your wishlist." });
    }

    try {
        // Update the user's last active timestamp
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Verify the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Fetch or create the user's wishlist
        let wishlist = await Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user.userId,
                items: [] // Initialize with an empty array
            });
        }

        // Check if the product is already in the wishlist
        const existingItemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex !== -1) {
            // Product already exists, return current wishlist
            return res.json({ success: true, message: "Product is already in wishlist.", wishlist });
        } else {
            // Add the product to the wishlist
            wishlist.items.push({
                product: product._id,
            });
            await wishlist.save();
            return res.json({ success: true, message: "Product added to wishlist.", wishlist });
        }
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Add to Wishlist Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Try again." });
    }
};

// Remove a product from the user's wishlist
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.body;

    // Check if the user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to remove items from your wishlist." });
    }

    try {
        // Update the user's last active timestamp
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastActive = new Date();
            await user.save();
        }

        // Fetch the user's wishlist
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: "Wishlist not found." });
        }

        // Find the index of the product in the wishlist
        const itemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            // Product not found in wishlist
            return res.status(404).json({ success: false, message: "Product not found in wishlist." });
        }

        // Remove the product from the wishlist
        wishlist.items.splice(itemIndex, 1);
        await wishlist.save();

        // Respond with success message and updated wishlist
        return res.json({ success: true, message: "Product removed from wishlist.", wishlist });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Remove from Wishlist Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Try again." });
    }
};

// Render the user's wishlist page
exports.renderWishlist = async (req, res) => {
    // Check if the user is authenticated
    if (!req.user) {
        return res.status(401).render("auth/login", { error: "Please log in to view your wishlist." });
    }

    try {
        // Fetch the user's wishlist with populated product details
        const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate('items.product');

        // Handle case where wishlist is empty or doesn't exist
        if (!wishlist || wishlist.items.length === 0) {
            return res.render("user/wishlist", { 
                user: req.user,
                wishlist: [] // Render with an empty list
            });
        }

        // Render the wishlist page with populated items
        return res.render("user/wishlist", { 
            user: req.user,
            wishlist: wishlist.items // Pass wishlist items to the template
        });
    } catch (error) {
        // Log error for debugging and render with an error message
        console.error("❌ Render Wishlist Error:", error);
        return res.status(500).render("user/wishlist", { 
            user: req.user,
            wishlist: [], // Empty list as fallback
            errorMessage: "Server error. Try again." // Inform user of the issue
        });
    }
};