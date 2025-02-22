const express = require("express");
const router = express.Router();
const { authenticateUser, verifyUser } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// ✅ Cart Page Route
router.get("/", authenticateUser, verifyUser, cartController.renderCart);

// ✅ Add to Cart Route
router.post("/add", authenticateUser, cartController.addToCart);

// ✅ Render Checkout Page
router.get("/checkout", authenticateUser, verifyUser, cartController.renderCheckout);

module.exports = router;