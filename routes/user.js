const express = require("express");
const router = express.Router();
const {authenticateUser,verifyUser } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");



// ✅ User Dashboard Route
router.get("/dashboard" ,authenticateUser,verifyUser, userController.renderDashboard);

// ✅ Update Profile Route
router.post("/update-profile",authenticateUser, userController.updateProfile);

// ✅ Change Password Route
router.post("/change-password",authenticateUser, userController.changePassword);


module.exports = router;




