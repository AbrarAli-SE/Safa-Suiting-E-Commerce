const express = require("express");
const authController = require("../controllers/authController"); // ✅ Import authController

const router = express.Router();


// ✅ Google OAuth Routes
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleAuthCallback);

// ✅ Serve Register, Login, and Forgot Password Pages
// ✅ Register Page (GET) - Render Registration Form
router.get("/register", authController.renderRegisterPage);

// ✅ Register User (POST) - Handles Registration & Sends OTP
router.post("/register", authController.register);

// ✅ OTP Verification Page (GET) - Render OTP Input Page
router.get("/verify-otp", authController.renderOtpPage);

// ✅ Verify OTP (POST) - Verifies OTP and Logs User In
router.post("/verify-otp", authController.verifyOTP);

// ✅ Resend OTP (POST) - Resends OTP to User Email
router.post("/resend-otp", authController.resendOTP);

// ✅ Render Login Page (GET)
router.get("/login", authController.renderLoginPage);

// ✅ Handle Login Submission (POST)
router.post("/login", authController.login);

// ✅ Render Forgot Password Page (GET)
router.get("/forgot-password", authController.renderForgotPasswordPage);

// ✅ Handle Forgot Password Submission (POST)
router.post("/forgot-password", authController.forgotPassword);

// ✅ Ensure Logout Route Exists
router.get("/logout", authController.logout);

module.exports = router;

