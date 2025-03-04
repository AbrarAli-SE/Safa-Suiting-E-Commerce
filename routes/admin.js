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


router.get("/coupon-code",authenticateUser,adminAuth, adminController.getCouponPage);
router.get('/coupons', authenticateUser,adminAuth, adminController.getCoupons);
router.post('/coupons/create', authenticateUser,adminAuth, adminController.createCoupon);
router.delete('/coupons/delete/:id', authenticateUser,adminAuth, adminController.deleteCoupon);


router.get("/payment",authenticateUser,adminAuth, adminController.renderPayment);


router.get("/assign-id",authenticateUser,adminAuth, adminController.renderTrackId);


router.get("/cancel-order",authenticateUser,adminAuth, adminController.renderCancelOrder);


router.get("/analytical",authenticateUser,adminAuth, adminController.renderAnalytical);






// ✅ Admin Contact Submissions Page
router.get("/contacts", authenticateUser, adminAuth, adminController.renderContacts);


// ✅ Delete Contact Message
router.delete("/contacts/delete", authenticateUser, adminAuth, adminController.deleteContact);
router.post("/contacts/reply", authenticateUser, adminAuth, adminController.replyToContact);
router.put('/update-shipping-tax', authenticateUser,adminAuth , adminController.updateShippingTax);
router.get('/shipping-settings',authenticateUser,adminAuth , adminController.getShippingSettings);



module.exports = router;