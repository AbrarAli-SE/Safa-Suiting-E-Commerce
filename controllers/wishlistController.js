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
      let wishlist = await Wishlist.findOne({ user: req.user.userId });  // Use req.user._id instead of req.user.userId

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
      res.status(500).json({ error: "Server error. Try again." });
  }
};










// ✅ Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Please log in to remove items from your wishlist." });
  }

  try {
    // Find the user's wishlist
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

    return res.json({ success: true, message: "Product removed from wishlist." });
  } catch (error) {
    console.error("❌ Remove from Wishlist Error:", error);
    return res.status(500).json({ success: false, message: "Server error. Try again." });
  }
};


// ✅ Render Wishlist Page with User's Wishlist
exports.renderWishlist = async (req, res) => {
  // Check if user is logged in
  if (!req.user) {
      return res.status(401).json({ success: false, message: "Please log in to view your wishlist." });
  }

  // console.log("User Info:", req.user); // Log to check if user object is set correctly

  try {
      // Find the user's wishlist
      const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate('items.product');

      // If the wishlist does not exist
      if (!wishlist) {
          return res.render("user/wishlist", { wishlist: [] }); // Empty wishlist
      }

      // Render the wishlist page and pass the wishlist data to the view
      return res.render("user/wishlist", { wishlist: wishlist.items });
  } catch (error) {
      console.error("❌ Render Wishlist Error:", error);
      res.status(500).json({ error: "Server error. Try again." });
  }
};