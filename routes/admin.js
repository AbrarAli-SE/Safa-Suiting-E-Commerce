const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, adminAuth } = require("../middleware/authMiddleware");

// ✅ User Dashboard Route
router.get("/intro", verifyToken, adminAuth, adminController.renderAdminDashboard);

module.exports = router;