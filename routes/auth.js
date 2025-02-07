const express = require("express");
const authController = require("../controllers/authController"); // ✅ Import authController
const authRestrictionMiddleware = require("../middleware/authRestrictionMiddleware");

const router = express.Router();


// ✅ Google OAuth Routes
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleAuthCallback);

// ✅ Prevent logged-in users from accessing register, login, verify OTP, and resend OTP
router.get("/register", authRestrictionMiddleware.restrictAuthRoutesForLoggedInUsers, authController.renderRegisterPage);
router.post("/register", authRestrictionMiddleware.restrictAuthRoutesForLoggedInUsers, authController.register);

// ✅ OTP Verification Page & Submission - Only Accessible During Registration
router.get("/verify-otp", authRestrictionMiddleware.restrictOtpAccess, authController.renderOtpPage);
router.post("/verify-otp", authRestrictionMiddleware.restrictOtpAccess, authController.verifyOTP);

// ✅ Resend OTP - Only Allowed During Registration
router.post("/resend-otp", authRestrictionMiddleware.restrictOtpAccess, authController.resendOTP);

router.get("/login", authRestrictionMiddleware.restrictAuthRoutesForLoggedInUsers, authController.renderLoginPage);
router.post("/login", authRestrictionMiddleware.restrictAuthRoutesForLoggedInUsers, authController.login);

// ✅ Forgot Password - Accessible to Anyone
router.get("/forgot-password", authController.renderForgotPasswordPage);
router.post("/forgot-password", authController.forgotPassword);

// ✅ Ensure Logout Route Exists
router.get("/logout", authController.logout);

module.exports = router;

