const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, adminAuth } = require("../middleware/authMiddleware");

// ✅ User Dashboard Route
router.get("/intro", verifyToken, adminAuth, adminController.renderAdminDashboard);

router.get("/users", verifyToken, adminAuth, adminController.renderManageUsers);

router.get("/users/:userId", verifyToken, adminAuth, adminController.renderUserDetails);

// ✅ Update User Role Route
router.post("/users/update-role", verifyToken, adminAuth, adminController.updateUserRole);


module.exports = router;