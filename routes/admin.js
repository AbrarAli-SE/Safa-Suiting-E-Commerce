const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateUser, adminAuth } = require("../middleware/authMiddleware");
// const { uploadCarousel } = require("../config/multer-config");

router.put("/carousel/upload", authenticateUser, adminAuth,  adminController.uploadCarouselImages); // ✅ Changed to PUT
router.get("/carousel/get", authenticateUser, adminAuth, adminController.getCarouselImages);
// ✅ Fetch Unread Notifications
router.get("/notifications", authenticateUser, adminAuth, adminController.getNotifications);

// ✅ Mark Notifications as Read
router.post("/notifications/mark-read", authenticateUser, adminAuth, adminController.markNotificationsAsRead);

// ✅ User Dashboard Route
router.get("/intro", authenticateUser, adminAuth, adminController.renderAdminDashboard);

router.get("/users", authenticateUser, adminAuth, adminController.renderManageUsers);

router.get("/users/:userId", authenticateUser, adminAuth, adminController.renderUserDetails);

// ✅ Update User Role Route
router.put("/users/update-role", authenticateUser, adminAuth, adminController.updateUserRole);

// ✅ Admin Settings Page Route
router.get("/settings", authenticateUser, adminAuth, adminController.renderAdminSettings);

// ✅ Update Profile Route
router.post("/update-profile",authenticateUser,adminAuth, adminController.updateProfile);

// ✅ Change Password Route
router.post("/change-password",authenticateUser,adminAuth, adminController.changePassword);


router.get("/coupon-code",authenticateUser,adminAuth, adminController.renderCouponCode);


router.get("/payment",authenticateUser,adminAuth, adminController.renderPayment);


router.get("/assign-id",authenticateUser,adminAuth, adminController.renderTrackId);


router.get("/cancel-order",authenticateUser,adminAuth, adminController.renderCancelOrder);


router.get("/analytical",authenticateUser,adminAuth, adminController.renderAnalytical);


router.get("/manage-coursel", authenticateUser, adminAuth, adminController.renderCoursel); // ✅ Added route




// ✅ Admin Contact Submissions Page
router.get("/contacts", authenticateUser, adminAuth, adminController.renderContacts);


// ✅ Delete Contact Message
router.post("/contacts/delete", authenticateUser, adminAuth, adminController.deleteContact);



module.exports = router;