const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // ✅ Fix Typo
const {authenticateUser , verifyUser } = require("../middleware/authMiddleware");

// Orders History Route
router.get("/orders", authenticateUser,verifyUser, orderController.renderOrders);

module.exports = router;