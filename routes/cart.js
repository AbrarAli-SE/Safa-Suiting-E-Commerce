const express = require("express");
const router = express.Router();
const { authenticateUser, verifyUser } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// ✅ Cart Page Route
router.get("/", authenticateUser, cartController.renderCart);

// ✅ Add to Cart Route
router.post("/add", authenticateUser, cartController.addToCart);

// PUT route to update the cart
router.put('/update', authenticateUser, cartController.updateCart);

// DELETE route to remove an item from the cart
router.delete('/remove/:itemId', authenticateUser, cartController.deleteItem)

// ✅ Render Checkout Page
router.get("/checkout", authenticateUser,  cartController.renderCheckout);

module.exports = router;

