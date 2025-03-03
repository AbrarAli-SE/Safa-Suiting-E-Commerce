const express = require("express");
const router = express.Router();
const {authenticateUser , verifyUser } = require("../middleware/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

// ✅ Render Wishlist Page
router.get("/", authenticateUser,wishlistController.renderWishlist);

// ✅ Add to Wishlist
router.post("/add", authenticateUser, wishlistController.addToWishlist);

// ✅ Remove from Wishlist (Changed to DELETE)
router.delete("/remove", authenticateUser, wishlistController.removeFromWishlist);


module.exports = router;