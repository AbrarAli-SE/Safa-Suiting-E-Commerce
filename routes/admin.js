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

// ✅ Admin Settings Page Route
router.get("/settings", verifyToken, adminAuth, adminController.renderAdminSettings);

// ✅ Update Profile Route
router.post("/update-profile",verifyToken,adminAuth, adminController.updateProfile);

// ✅ Change Password Route
router.post("/change-password",verifyToken,adminAuth, adminController.changePassword);


router.get("/coupon-code",verifyToken,adminAuth, adminController.renderCouponCode);


router.get("/payment",verifyToken,adminAuth, adminController.renderPayment);


router.get("/assign-id",verifyToken,adminAuth, adminController.renderTrackId);


router.get("/cancel-order",verifyToken,adminAuth, adminController.renderCancelOrder);


router.get("/analytical",verifyToken,adminAuth, adminController.renderAnalytical);


router.get("/manage-coursel",verifyToken,adminAuth, adminController.renderCoursel);

// ✅ Admin Contact Submissions Page
router.get("/contacts", verifyToken, adminAuth, adminController.renderContacts);




module.exports = router;