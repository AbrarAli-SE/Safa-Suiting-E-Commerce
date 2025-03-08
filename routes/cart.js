const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// ✅ Cart Page Route
router.get("/", authenticateUser, cartController.renderCart);

// ✅ Add to Cart Route
router.post("/add", authenticateUser, cartController.addToCart);

// PUT route to update the cart
router.put('/update', authenticateUser, cartController.updateCart);

// DELETE route to remove an item from the cart
router.delete('/remove/:itemId', authenticateUser, cartController.deleteItem);

router.get('/checkout',authenticateUser, cartController.checkoutCart);
router.post('/checkout',authenticateUser, cartController.processCheckout);


router.get('/order-confirmation',authenticateUser, cartController.renderOrderConfirmation);



// router.get("/checkout", authenticateUser,  cartController.renderCheckout);

module.exports = router;

