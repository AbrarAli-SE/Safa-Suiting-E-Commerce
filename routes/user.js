const express = require("express");
const router = express.Router();
const {verifyToken , verifyUser } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// ✅ User Dashboard Route
router.get("/dashboard" ,verifyToken,verifyUser, userController.renderDashboard);

// ✅ Update Profile Route
router.post("/update-profile",verifyToken, userController.updateProfile);

// ✅ Change Password Route
router.post("/change-password",verifyToken, userController.changePassword);

module.exports = router;
