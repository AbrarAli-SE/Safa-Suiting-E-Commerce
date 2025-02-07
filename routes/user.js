const express = require("express");
const router = express.Router();
const {verifyToken , verifyUser } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
// const wishlistController = require("../controllers/wishlistController");


// ✅ User Dashboard Route
router.get("/dashboard" ,verifyToken,verifyUser, userController.renderDashboard);

// ✅ Update Profile Route
router.post("/update-profile",verifyToken, userController.updateProfile);

// ✅ Change Password Route
router.post("/change-password",verifyToken, userController.changePassword);

// ✅ Render Wishlist Page
router.get("/wishlist", verifyToken, verifyUser, userController.renderWishlist);

// ✅ Add to Wishlist Route
// router.post("/add", verifyToken, wishlistController.addToWishlist);

// ✅ Remove from Wishlist Route
// router.post("/remove", verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
