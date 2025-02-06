const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

// ✅ User Dashboard Route
router.get("/intro", verifyToken, adminController.renderAdminDashboard);

module.exports = router;