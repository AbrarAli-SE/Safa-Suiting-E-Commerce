const Contact = require("../models/Contact");
const ContactInfo = require("../models/info");

// ✅ Render About Page
exports.renderAboutPage = async (req, res) => {
    try {
      // Fetch the contact details from the database
      const contactInfo = await ContactInfo.findOne({}).lean(); // Use lean() for plain JS object
  
      // Provide default values if contactInfo is null
      const contactData = contactInfo || {
        phoneNumber: "Not set",
        supportEmail: "Not set",
        aboutUs: "Information not available yet."
      };
  
      // Pass user and contact details to the EJS template
      res.render("pages/about", { 
        user: req.user || null, 
        contactInfo: {
          phoneNumber: contactData.phoneNumber,
          supportEmail: contactData.supportEmail,
          aboutUs: contactData.aboutUs
        }
      });
    } catch (error) {
      console.error("❌ About Page Error:", error);
      res.status(500).send("Server error");
    }
  };

// ✅ Render Contact Page


exports.renderContactPage = async (req, res) => {
    try {
        // Fetch the contact data (you can adjust the query as per your requirements)
        const contactInfo = await ContactInfo.findOne({}).lean();
        // Provide default values if contactInfo is null
      const contactData = contactInfo || {
        customerEmail: "Not set",
        supportEmail: "Not set",
        phoneNumber: "Not set"
      };

        // Render the page and pass the data
        res.render("pages/contact", { 
            user: req.user || null, 
            successMessage: null, 
            errorMessage: null, 
            contactInfo: {
                customerEmail: contactData.customerEmail,
                supportEmail: contactData.supportEmail,
                phoneNumber: contactData.phoneNumber
              }
        });
    } catch (error) {
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
         await Contact.create({ name, email, phone, message});

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
