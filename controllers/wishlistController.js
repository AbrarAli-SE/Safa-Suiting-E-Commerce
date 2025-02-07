const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

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

// ✅ Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId }] });
    } else {
      const existingItem = wishlist.items.find((item) => item.productId.toString() === productId);
      if (existingItem) {
        return res.status(400).json({ error: "Product already in wishlist." });
      }
      wishlist.items.push({ productId });
    }

    await wishlist.save();
    return res.status(200).json({ success: "Product added to wishlist!" });
  } catch (error) {
    console.error("❌ Add to Wishlist Error:", error);
    res.status(500).json({ error: "Server error. Try again." });
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
