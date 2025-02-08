const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // ✅ Fix Typo
const {verifyToken , verifyUser } = require("../middleware/authMiddleware");

// ✅ Ensure Callback Functions Exist
router.get("/cancel-order", verifyToken, verifyUser, orderController.renderUserCancel);
router.get("/user-order", verifyToken, verifyUser, orderController.renderCartOrder);

module.exports = router;
