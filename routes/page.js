const express = require("express");
const verifyToken = require("../middleware/authMiddleware"); // ✅ Ensure user authentication is checked
const pageController = require("../controllers/pageController");

const router = express.Router();

// ✅ Serve About & Contact Pages for Logged-in Users
router.get("/about",verifyToken, pageController.renderAboutPage);
router.get("/contact",verifyToken, pageController.renderContactPage);

// ✅ Handle Contact Form Submission
router.post("/contact",verifyToken ,pageController.handleContactForm);

module.exports = router;
