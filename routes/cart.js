const express = require("express");
const router = express.Router();
const {verifyToken , verifyUser } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// ✅ Cart Page Route
router.get("/", verifyToken ,verifyUser , cartController.renderCart);


// ✅ Render Checkout Page
router.get("/checkout", verifyToken, verifyUser, cartController.renderCheckout);

// ✅ Add to Cart Route
router.post("/add", verifyToken, cartController.addToCart);

// ✅ Remove from Cart Route
router.post("/remove", verifyToken, cartController.removeFromCart);

// ✅ Clear Cart Route (For Checkout)
router.post("/clear", verifyToken, cartController.clearCart);

module.exports = router;