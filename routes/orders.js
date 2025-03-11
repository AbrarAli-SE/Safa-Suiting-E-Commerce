const express = require("express");
const router = express.Router();
const { authenticateUser, verifyUser } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// Order Routes
router.get("/active-orders", authenticateUser, verifyUser, orderController.renderOrders);
router.delete("/orders/cancel/:orderId", authenticateUser, verifyUser, orderController.cancelOrder);
router.get("/cancelled-orders", authenticateUser, verifyUser, orderController.renderCancelledOrders);

module.exports = router;