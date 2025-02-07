const express = require("express");
const router = express.Router();
const {verifyToken , verifyUser } = require("../middleware/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

// ✅ Render Wishlist Page
router.get("/", verifyToken,verifyUser ,wishlistController.renderWishlist);

// ✅ Add to Wishlist
router.post("/add", verifyToken, wishlistController.addToWishlist);

// ✅ Remove from Wishlist
router.post("/remove", verifyToken, wishlistController.removeFromWishlist);

// ✅ Clear Wishlist
router.post("/clear", verifyToken, wishlistController.clearWishlist);

module.exports = router;