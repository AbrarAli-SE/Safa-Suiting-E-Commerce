const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // ✅ Fix Typo
const {authenticateUser , verifyUser } = require("../middleware/authMiddleware");

// ✅ Ensure Callback Functions Exist
router.get("/cancel-order", authenticateUser, verifyUser, orderController.renderUserCancel);
router.get("/user-order", authenticateUser, verifyUser, orderController.renderCartOrder);

module.exports = router;
