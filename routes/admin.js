const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateUser, adminAuth } = require("../middleware/authMiddleware");

router.put("/carousel/upload", authenticateUser, adminAuth, adminController.uploadCarouselImages);
router.get("/carousel/get", authenticateUser, adminAuth, adminController.getCarouselImages);
router.get("/manage-carousel", authenticateUser, adminAuth, adminController.renderCoursel); // Fixed typo: "coursel" -> "carousel"




router.get("/users", authenticateUser, adminAuth, adminController.renderManageUsers);

router.get("/users/:userId", authenticateUser, adminAuth, adminController.renderUserDetails);

// ✅ Update User Role Route
router.put("/users/update-role", authenticateUser, adminAuth, adminController.updateUserRole);

router.put("/update-profile", authenticateUser, adminAuth, adminController.updateProfile);
router.put("/change-password", authenticateUser, adminAuth, adminController.changePassword);
router.put("/update-contact", authenticateUser, adminAuth, adminController.updateContact);
router.get("/setting", authenticateUser, adminAuth, adminController.renderSettings);




router.get("/payment",authenticateUser,adminAuth, adminController.renderPayment);
// Get payments (AJAX)
router.get('/payments', authenticateUser, adminAuth, adminController.getPayments);

// Toggle payment received status (AJAX)
router.put('/payments/toggle-received', authenticateUser, adminAuth, adminController.toggleReceived);

// Delete payment (AJAX)
router.delete('/payments/delete', authenticateUser, adminAuth, adminController.deletePayment);


router.get("/assign-id",authenticateUser,adminAuth, adminController.renderTrackId);

router.get('/orders', authenticateUser,adminAuth, adminController.renderAdminOrders);
router.put('/orders/assign-tracking',authenticateUser,adminAuth, adminController.assignTrackingId);
router.get('/orders/:orderId', authenticateUser,adminAuth, adminController.getOrderDetails);
router.delete('/orders/:orderId', authenticateUser,adminAuth, adminController.deleteOrder);


router.get("/cancel-order",authenticateUser,adminAuth, adminController.renderAdminCancelledOrders);
router.delete("/cancel-order/delete",authenticateUser,adminAuth, adminController.deleteCancelledOrder);


router.get('/analytics', authenticateUser, adminAuth, adminController.renderAnalytics);






// ✅ Admin Contact Submissions Page
router.get("/contacts", authenticateUser, adminAuth, adminController.renderContacts);


// ✅ Delete Contact Message
router.delete("/contacts/delete", authenticateUser, adminAuth, adminController.deleteContact);
router.post("/contacts/reply", authenticateUser, adminAuth, adminController.replyToContact);
router.put('/update-shipping-tax', authenticateUser,adminAuth , adminController.updateShippingTax);
router.get('/shipping-settings',authenticateUser,adminAuth , adminController.getShippingSettings);



module.exports = router;