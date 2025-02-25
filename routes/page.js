const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const pageController = require("../controllers/pageController");

const router = express.Router();

router.get("/about", authenticateUser, pageController.renderAboutPage);
router.get("/contact", authenticateUser, pageController.renderContactPage);
router.post("/contact", authenticateUser, pageController.handleContactForm);

module.exports = router;