const User = require("../models/User");
const Product = require("../models/Product");

// ✅ Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // ✅ Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // ✅ Check if already in wishlist
    const user = await User.findById(userId);
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product already in wishlist." });
    }

    // ✅ Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({ success: "Product added to wishlist!" });
  } catch (error) {
    console.error("❌ Wishlist Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};

// ✅ Remove Product from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // ✅ Remove from wishlist
    await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });

    return res.status(200).json({ success: "Product removed from wishlist!" });
  } catch (error) {
    console.error("❌ Remove Wishlist Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
  }
};

