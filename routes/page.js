const express = require("express");
const {authenticateUser} = require("../middleware/authMiddleware"); // ✅ Ensure user authentication is checked
const pageController = require("../controllers/pageController");

const router = express.Router();

// ✅ Serve About & Contact Pages for Logged-in Users
router.get("/about",authenticateUser, pageController.renderAboutPage);
router.get("/contact",authenticateUser, pageController.renderContactPage);

// ✅ Handle Contact Form Submission
router.post("/contact",authenticateUser ,pageController.handleContactForm);

module.exports = router;
