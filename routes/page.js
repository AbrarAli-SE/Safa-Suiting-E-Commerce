const express = require("express");
const pageController = require("../controllers/pageController");

const router = express.Router();

// ✅ Serve About & Contact Pages
router.get("/about", pageController.renderAboutPage);
router.get("/contact", pageController.renderContactPage);

// ✅ Handle Contact Form Submission
router.post("/contact", pageController.handleContactForm);

module.exports = router;
