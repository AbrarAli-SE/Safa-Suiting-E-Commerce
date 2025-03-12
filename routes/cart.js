const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// Cart Page Route
router.get("/", authenticateUser, cartController.renderCart);

// Add to Cart Route
router.post("/add", authenticateUser, cartController.addToCart);


// Update Cart Route
router.put("/update", authenticateUser, cartController.updateCart);

// Remove Item from Cart Route
router.delete("/remove/:itemId", authenticateUser, cartController.deleteItem);

// Checkout Routes
router.get("/checkout", authenticateUser, cartController.checkoutCart);
router.post("/checkout", authenticateUser, cartController.processCheckout);

// Order Confirmation Route
router.get("/order-confirmation", authenticateUser, cartController.renderOrderConfirmation);

module.exports = router;