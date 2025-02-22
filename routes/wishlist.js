const express = require("express");
const router = express.Router();
const {authenticateUser , verifyUser } = require("../middleware/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

// ✅ Render Wishlist Page
router.get("/", authenticateUser,verifyUser ,wishlistController.renderWishlist);

// ✅ Add to Wishlist
router.post("/add", authenticateUser, wishlistController.addToWishlist);

// ✅ Remove from Wishlist
router.post("/remove", authenticateUser, wishlistController.removeFromWishlist);

// ✅ Clear Wishlist
router.post("/clear", authenticateUser, wishlistController.clearWishlist);

module.exports = router;