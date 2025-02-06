const Contact = require("../models/Contact");

// ✅ Render About Page
exports.renderAboutPage = (req, res) => {
    try
    {
        res.render("pages/about", { user: req.user || null }); // ✅ Pass user to EJS
    }
    catch(error)
    {
        console.error("❌ About Page Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Render Contact Page
exports.renderContactPage = (req, res) => {
    try
    {
        res.render("pages/contact", { user: req.user || null, successMessage: null, errorMessage: null });
    }catch(error)
    {
        console.error("❌ Contact Page Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Handle Contact Form Submission
exports.handleContactForm = async (req, res) => {
    try {
        const { name, email,phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.render("pages/contact", { 
                user: req.user || null,
                errorMessage: "All fields are required.",
                successMessage: null
            });
        }

         // ✅ Save contact form data to the database
         await Contact.create({ name, email, phone, message });

        // ✅ Simulate email sending (Replace this with your email service)
        console.log(`📧 Contact Form Submission: Name: ${name}, Email: ${email}, Message: ${message}`);

        return res.render("pages/contact", { 
            user: req.user || null,
            successMessage: "Your message has been sent successfully!",
            errorMessage: null
        });

    } catch (error) {
        console.error("❌ Contact Form Error:", error);
        res.render("pages/contact", { 
            user: req.user || null,
            errorMessage: "Server error. Please try again.",
            successMessage: null
        });
    }
};
