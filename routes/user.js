const express = require("express");
const router = express.Router();
const { authenticateUser, verifyUser } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/dashboard", authenticateUser, verifyUser, userController.renderDashboard);
router.put("/update-profile", authenticateUser, verifyUser, userController.updateProfile);
router.put("/change-password", authenticateUser, verifyUser, userController.changePassword);
router.get("/profile-data", authenticateUser,verifyUser, userController.getProfileData);

module.exports = router;