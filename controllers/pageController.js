const Contact = require("../models/Contact");
const ContactInfo = require("../models/info");

// Render the About page with contact information
exports.renderAboutPage = async (req, res) => {
    try {
        // Fetch the contact details from the database for display
        const contactInfo = await ContactInfo.findOne({}).lean(); // Use lean() for plain JS object

        // Set fallback values if no contact info exists in the database
        const contactData = contactInfo || {
            phoneNumber: "Not set",
            supportEmail: "Not set",
            aboutUs: "Information not available yet."
        };

        // Render the About page with user data and contact details
        res.render("pages/about", { 
            user: req.user || null, // Pass authenticated user or null if not logged in
            contactInfo: {
                phoneNumber: contactData.phoneNumber,
                supportEmail: contactData.supportEmail,
                aboutUs: contactData.aboutUs
            }
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ About Page Error:", error);
        res.status(500).send("Server error");
    }
};

// Render the Contact page with contact information
exports.renderContactPage = async (req, res) => {
    try {
        // Fetch contact information from the database
        const contactInfo = await ContactInfo.findOne({}).lean();

        // Provide default values if no contact info is found
        const contactData = contactInfo || {
            customerEmail: "Not set",
            supportEmail: "Not set",
            phoneNumber: "Not set"
        };

        // Render the Contact page with user data and contact details
        res.render("pages/contact", { 
            user: req.user || null, // Pass authenticated user or null if not logged in
            successMessage: null, // Initial state: no success message
            errorMessage: null, // Initial state: no error message
            contactInfo: {
                customerEmail: contactData.customerEmail,
                supportEmail: contactData.supportEmail,
                phoneNumber: contactData.phoneNumber
            }
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Contact Page Error:", error);
        res.status(500).send("Server error");
    }
};

// Handle submission of the contact form
exports.handleContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate that all required fields are provided
        if (!name || !email || !phone || !message) {
            return res.render("pages/contact", { 
                user: req.user || null,
                errorMessage: "All fields are required.", // Notify user of missing fields
                successMessage: null
            });
        }

        // Save the contact form submission to the database
        await Contact.create({ name, email, phone, message });

        // Render the Contact page with a success message
        return res.render("pages/contact", { 
            user: req.user || null,
            successMessage: "Your message has been sent successfully!", // Confirm submission
            errorMessage: null
        });
    } catch (error) {
        // Log error for debugging and render the page with an error message
        console.error("❌ Contact Form Error:", error);
        res.render("pages/contact", { 
            user: req.user || null,
            errorMessage: "Server error. Please try again.", // Inform user of failure
            successMessage: null
        });
    }
};

// Render the Policy page with support email
exports.renderPolicyPage = async (req, res) => {
    try {
        // Fetch contact information from the database
        const contactInfo = await ContactInfo.findOne({}).lean();

        // Provide default value for support email if no contact info exists
        const contactData = contactInfo || {
            supportEmail: "Not set"
        };

        // Render the Policy page with user data and support email
        res.render("pages/policy", { 
            user: req.user || null, // Pass authenticated user or null if not logged in
            contactInfo: {
                supportEmail: contactData.supportEmail
            }
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Contact Page Error:", error);
        res.status(500).send("Server error");
    }
};

// Render the FAQ page
exports.renderFaqPage = (req, res) => {
    try {
        // Render the FAQ page with user data (no additional data required)
        res.render("pages/faq", { 
            user: req.user || null // Pass authenticated user or null if not logged in
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Contact Page Error:", error);
        res.status(500).send("Server error");
    }
};