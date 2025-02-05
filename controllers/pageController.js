// // ✅ Render About Page
// exports.renderAboutPage = (req, res) => {
//     res.render("pages/about");
// };

// // ✅ Render Contact Page
// exports.renderContactPage = (req, res) => {
//     res.render("pages/contact", { successMessage: null, errorMessage: null });
// };

// // ✅ Handle Contact Form Submission
// exports.handleContactForm = async (req, res) => {
//     try {
//         const { name, email, message } = req.body;

//         // Simulate sending an email (You can integrate Nodemailer here)
//         console.log(`📧 Contact Form Submitted: \nName: ${name}\nEmail: ${email}\nMessage: ${message}`);

//         // Render page with success message
//         res.render("pages/contact", { successMessage: "Your message has been sent successfully!", errorMessage: null });

//     } catch (error) {
//         console.error("❌ Contact Form Error:", error);
//         res.render("pages/contact", { successMessage: null, errorMessage: "An error occurred. Please try again." });
//     }
// };

// ✅ Render About Page
exports.renderAboutPage = (req, res) => {
    res.render("pages/about", { user: req.user || null }); // ✅ Pass user to EJS
};

// ✅ Render Contact Page
exports.renderContactPage = (req, res) => {
    res.render("pages/contact", { user: req.user || null, successMessage: null, errorMessage: null });
};

// ✅ Handle Contact Form Submission
exports.handleContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.render("pages/contact", { 
                user: req.user || null,
                errorMessage: "All fields are required.",
                successMessage: null
            });
        }

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
