const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { getOrCreateGuestId } = require('../utils/guestId');

exports.addToWishlist = async (req, res) => {
    const { productId } = req.body; // Get product ID from AJAX request

    try {
        // Determine the identifier (user ID or guest ID)
        let identifier;
        if (req.user) {
            identifier = { user: req.user.userId }; // Assuming req.user.userId is correct from your auth middleware
        } else {
            const guestId = req.cookies.guestId || getOrCreateGuestId(req, res); // Use existing or create new
            identifier = { guestId };
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Find the wishlist using the identifier
        let wishlist = await Wishlist.findOne(identifier);

        // If the wishlist does not exist, create a new one
        if (!wishlist) {
            wishlist = new Wishlist({
                ...identifier, // Spread the identifier (either { user } or { guestId })
                items: []
            });
        }

        // Check if the product is already in the wishlist
        const existingItemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex !== -1) {
            // If the product already exists, do nothing and return success
            return res.json({ success: true, message: "Product is already in wishlist.", wishlist });
        } else {
            // If the product does not exist, add it to the wishlist
            wishlist.items.push({
                product: product._id,
                name: product.name,
                img: product.image,
                price: product.price,
                discountPrice: product.discountPrice,
            });

            await wishlist.save(); // Save the updated wishlist
            return res.json({ success: true, message: "Product added to wishlist.", wishlist });
        }

    } catch (error) {
        console.error("❌ Add to Wishlist Error:", error);
        return res.status(500).json({ success: false, message: "Server error. Try again." });
    }
};







// ✅ Remove item from wishlist

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    // Determine the identifier (user ID or existing guest ID)
    let identifier = {};
    if (req.user) {
      identifier = { user: req.user.userId };
    } else if (req.cookies.guestId) {
      identifier = { guestId: req.cookies.guestId };
    } else {
      return res.status(404).json({ success: false, message: "No wishlist available. Please add items first." });
    }

    // Find the wishlist
    const wishlist = await Wishlist.findOne(identifier);
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
  try {
    // Determine the identifier (user ID or existing guest ID)
    let identifier = {};
    if (req.user) {
      identifier = { user: req.user.userId };
    } else if (req.cookies.guestId) {
      identifier = { guestId: req.cookies.guestId };
    } else {
      // No user or guestId, render empty wishlist
      return res.render("user/wishlist", { 
        user: null, 
        wishlist: [] 
      });
    }

    // Find the wishlist with populated product details
    const wishlist = await Wishlist.findOne(identifier).populate('items.product');

    // If the wishlist does not exist or is empty
    if (!wishlist || wishlist.items.length === 0) {
      return res.render("user/wishlist", { 
        user: req.user || null, 
        wishlist: [] 
      });
    }

    // Render the wishlist page with data
    return res.render("user/wishlist", { 
      user: req.user || null, 
      wishlist: wishlist.items 
    });

  } catch (error) {
    console.error("❌ Render Wishlist Error:", error);
    return res.status(500).render("user/wishlist", { 
      user: req.user || null, 
      wishlist: [], 
      errorMessage: "Server error. Try again." 
    });
  }
};