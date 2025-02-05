// ✅ Render About Page
exports.renderAboutPage = (req, res) => {
    res.render("pages/about");
};

// ✅ Render Contact Page
exports.renderContactPage = (req, res) => {
    res.render("pages/contact", { successMessage: null, errorMessage: null });
};

// ✅ Handle Contact Form Submission
exports.handleContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Simulate sending an email (You can integrate Nodemailer here)
        console.log(`📧 Contact Form Submitted: \nName: ${name}\nEmail: ${email}\nMessage: ${message}`);

        // Render page with success message
        res.render("pages/contact", { successMessage: "Your message has been sent successfully!", errorMessage: null });

    } catch (error) {
        console.error("❌ Contact Form Error:", error);
        res.render("pages/contact", { successMessage: null, errorMessage: "An error occurred. Please try again." });
    }
};
