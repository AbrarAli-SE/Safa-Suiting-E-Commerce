const express = require("express");
const router = express.Router();
const { verifyToken, verifyUser } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// ✅ Cart Page Route
router.get("/", verifyToken, verifyUser, cartController.renderCart);

// ✅ Add to Cart Route
router.post("/add", verifyToken, cartController.addToCart);

// ✅ Render Checkout Page
router.get("/checkout", verifyToken, verifyUser, cartController.renderCheckout);

module.exports = router;