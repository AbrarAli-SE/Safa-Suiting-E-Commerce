const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");




// ✅ Add to Wishlist
exports.addToWishlist = async (req, res) => {
    const { productId } = req.body; // Get product ID from AJAX request

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Please log in to modify your wishlist." });
    }

    try {
        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // Find the user's wishlist
        let wishlist = await Wishlist.findOne({ user: req.user.userId});  // Use req.user._id instead of req.user.userId

        // If the wishlist does not exist, create a new one
        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user.userId,  // Use req.user._id to set the user
                items: []
            });
        }

        // Check if the product is already in the wishlist
        const existingItemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex !== -1) {
            // If the product exists, remove it from the wishlist
            wishlist.items.splice(existingItemIndex, 1);
            await wishlist.save(); // Save the updated wishlist
            return res.json({ success: true, message: "Product removed from wishlist.", wishlist });
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
        res.status(500).json({ error: "Server error. Try again." });
    }
};


// ✅ Render Wishlist Page
exports.renderWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate("items.productId");

    if (!wishlist || wishlist.items.length === 0) {
      return res.render("user/wishlist", { user: req.user, wishlist: [] });
    }

    res.render("pages/wishlist", { user: req.user, wishlist: wishlist.items });
  } catch (error) {
    console.error("❌ Wishlist Page Error:", error);
    res.status(500).send("Server error");
  }
};


// ✅ Remove from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found." });
    }

    wishlist.items = wishlist.items.filter((item) => item.productId.toString() !== productId);
    await wishlist.save();

    return res.status(200).json({ success: "Product removed from wishlist!" });
  } catch (error) {
    console.error("❌ Remove Wishlist Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};

// ✅ Clear Wishlist
exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ userId: req.user._id });
    return res.status(200).json({ success: "Wishlist cleared successfully!" });
  } catch (error) {
    console.error("❌ Clear Wishlist Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};
