const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Contact = require("../models/Contact");
const ShippingSettings = require('../models/Shipping'); //
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/emailConfig');
const ContactInfo = require("../models/info");
const bcrypt = require("bcryptjs");
const Carousel = require("../models/Carousel");
const { uploadCarousel } = require("../config/multer-config");
const fs = require("fs").promises;
const path = require("path");

exports.uploadCarouselImages = async (req, res) => {
  uploadCarousel(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length < 1) {
        return res.status(400).json({ error: "Please upload at least 1 image." });
      }

      // Fetch existing carousel to preserve slides not being replaced
      const existingCarousel = await Carousel.findOne();
      let existingSlides = existingCarousel ? existingCarousel.slides : [];

      // Map uploaded files to new slides (only save image paths)
      const newSlides = req.files.map((file) => ({
        image: `/uploads/carousel/${file.filename}`, // Only store image path
      }));

      // Update the carousel with the new slides (replaces all existing ones)
      await Carousel.findOneAndUpdate(
        {},
        { slides: newSlides, updatedAt: Date.now() },
        { upsert: true, new: true }
      );

      // Clean up old images from disk if they were replaced
      if (existingSlides.length > 0) {
        const oldImagePaths = existingSlides.map(slide => path.join(__dirname, "../public", slide.image));
        const newImagePaths = newSlides.map(slide => path.join(__dirname, "../public", slide.image));
        const imagesToDelete = oldImagePaths.filter(path => !newImagePaths.includes(path));

        for (const imagePath of imagesToDelete) {
          try {
            await fs.unlink(imagePath);
          } catch (deleteError) {
            console.error("❌ File Delete Error:", deleteError);
          }
        }
      }

      res.status(200).json({ message: "Carousel updated successfully!" });
    } catch (error) {
      console.error("❌ Upload Carousel Error:", error);
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(path.join(__dirname, "../public/uploads/carousel", file.filename));
          } catch (deleteError) {
            console.error("❌ File Delete Error:", deleteError);
          }
        }
      }
      res.status(500).json({ error: "Server error. Please try again." });
    }
  });
};


exports.getCarouselImages = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    if (!carousel) {
      return res.status(200).json({ slides: [] });
    }
    res.status(200).json({ slides: carousel.slides });
  } catch (error) {
    console.error("❌ Get Carousel Images Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.renderCoursel = async (req, res) => {
  try {
    const carousel = await Carousel.findOne();
    res.render("admin/coursel", {
      carouselImages: carousel ? carousel.slides : [],
    });
  } catch (error) {
    console.error("❌ Render Carousel Error:", error);
    res.status(500).send("Server error");
  }
};




exports.renderContacts = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 10; // Contacts per page
    const skip = (page - 1) * limit;

    const totalContacts = await Contact.countDocuments();
    const contacts = await Contact.find()
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(200).json({
        contacts,
        currentPage: page,
        totalPages: Math.ceil(totalContacts / limit),
      });
    } else {
      res.render("admin/contact-list", {
        user: req.user,
        contacts: [], // Empty initially, populated via AJAX
        currentPage: 1,
        totalPages: 1,
      });
    }
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).send("Server error");
    }
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { contactId, page } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: "Invalid contact ID." });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found." });
    }

    await Contact.findByIdAndDelete(contactId);

    // Fetch updated contact list
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalContacts = await Contact.countDocuments();
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Contact deleted successfully!",
      contacts,
      currentPage: page,
      totalPages: Math.ceil(totalContacts / limit),
    });
  } catch (error) {
    console.error("❌ Contact Deletion Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};



exports.getCouponPage = async(req, res) =>{
    try {
        res.render("admin/CouponCode");
    } catch (error) {
        console.error("❌ CouponCode Error:", error);
        res.status(500).send("Server error");
    }
}

// Fetch all coupons (API)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Server error fetching coupons' });
  }
};

// Create a new coupon (API)
exports.createCoupon = async (req, res) => {
  try {
    const {
      coupon_code,
      coupon_name,
      coupon_type,
      discount_amount,
      min_order_value,
      expiry_date,
      start_date,
      usage_limit
    } = req.body;

    const coupon = new Coupon({
      coupon_code,
      coupon_name,
      coupon_type,
      discount_amount,
      min_order_value,
      expiry_date,
      start_date,
      usage_limit
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully!' });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(400).json({ error: 'Error creating coupon' });
  }
};


// Delete a coupon (API)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon deleted successfully!' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Server error deleting coupon' });
  }
};


exports.renderPayment = async(req, res) =>{
    try {
        res.render("admin/payment");
    } catch (error) {
        console.error("❌ Payment Error:", error);
        res.status(500).send("Server error");
    }
}

exports.renderTrackId = async(req, res) =>{
    try {
        res.render("admin/trackId");
    } catch (error) {
        console.error("❌ Track ID Error:", error);
        res.status(500).send("Server error");
    }
}


exports.renderCancelOrder = async(req, res) =>{
    try {
        res.render("orders/order-history");
    } catch (error) {
        console.error("❌ Cancel Order Error:", error);
        res.status(500).send("Server error");
    }
}

exports.renderAnalytical = async(req, res) =>{
    try {
        res.render("admin/analytical");
    } catch (error) {
        console.error("❌ Cancel Order Error:", error);
        res.status(500).send("Server error");
    }
}






exports.renderManageUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || "all";

    let query = {};
    if (filter !== "all") {
      query.role = filter;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query, "name email role lastActive")
      .sort({ lastActive: -1, createdAt: -1 }) // Sort by lastActive descending, then createdAt
      .skip(skip)
      .limit(limit)
      .lean();

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(200).json({
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      });
    } else {
      res.render("admin/manage-users", {
        user: req.user,
        users: [],
        currentPage: 1,
        totalPages: 1,
        successMessage: req.query.successMessage || null,
        errorMessage: req.query.errorMessage || null,
      });
    }
  } catch (error) {
    console.error("❌ Manage Users Page Error:", error);
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).send("Server error");
    }
  }
};
  
  exports.updateUserRole = async (req, res) => {
    try {
      const { userId, role } = req.body;
      const page = req.query.page || 1;
  
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role selection." });
      }
  
      // Check if req.user is set by authenticateUser
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "User not authenticated. Please log in." });
      }
  
      if (req.user.userId.toString() === userId) {
        return res.status(403).json({ error: "You cannot change your own role." });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      user.role = role;
      await user.save();
  
      // Fetch updated user list for the current page
      const limit = 10;
      const skip = (page - 1) * limit;
      const totalUsers = await User.countDocuments();
      const users = await User.find({}, "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      res.status(200).json({
        message: `Role updated successfully for ${user.email}`,
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      });
    } catch (error) {
      console.error("❌ Update User Role Error:", error);
      res.status(500).json({ error: "Server error. Please try again." });
    }
  };
  
  

 exports.renderUserDetails = async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Fetching User ID:", userId);
  
      if (!userId || userId.length !== 24) {
        console.error("❌ Invalid User ID Format:", userId);
        return res.status(400).render("admin/user-details", { error: "Invalid User ID", user: null });
      }
  
      const user = await User.findById(userId);
      console.log("Found User:", user);
  
      if (!user) {
        console.error("❌ User Not Found for ID:", userId);
        return res.status(404).render("admin/user-details", { error: "User not found", user: null });
      }
  
      // Fetch cart details
      const cart = await Cart.findOne({ user: userId });
      const cartCount = cart ? cart.items.length : 0;
      const cartTotalPrice = cart ? cart.totalPrice : 0;
  
      // Fetch wishlist details
      const wishlist = await Wishlist.findOne({ user: userId });
      const wishlistCount = wishlist ? wishlist.items.length : 0;
  
      res.render("admin/user-details", {
        user: {
          ...user._doc,
          cartCount,
          cartTotalPrice,
          wishlistCount,
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ User Details Error:", error);
      res.status(500).render("admin/user-details", { error: "Server error", user: null });
    }
  };






  
  exports.updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      if (user.email !== req.body.email) {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(400).json({ error: "Email already in use." });
        }
      }
  
      user.name = req.body.name;
      user.email = req.body.email;
      await user.save();
  
      return res.status(200).json({
        message: "Profile updated successfully!",
        user: { userId: user._id, name: user.name, email: user.email, role: user.role }, // Return full user data
      });
    } catch (error) {
      console.error("❌ Profile Update Error:", error);
      return res.status(500).json({ error: "Server error. Try again." });
    }
  };
  
  exports.changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const user = await User.findById(req.user.userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect." });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match." });
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      return res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {
      console.error("❌ Password Change Error:", error);
      return res.status(500).json({ error: "Server error. Try again." });
    }
  };

  exports.updateContact = async (req, res) => {
    try {
        const { phoneNumber, customerEmail, supportEmail, aboutUs, city } = req.body;
        
        let contactInfo = await ContactInfo.findOne();
        if (contactInfo) {
            contactInfo.phoneNumber = phoneNumber;
            contactInfo.customerEmail = customerEmail;
            contactInfo.supportEmail = supportEmail;
            contactInfo.aboutUs = aboutUs;
            contactInfo.city = city;
            await contactInfo.save();
        } else {
            contactInfo = await ContactInfo.create({
                phoneNumber,
                customerEmail,
                supportEmail,
                aboutUs,
                city
            });
        }

        res.status(200).json({
            message: 'Contact info updated successfully',
            contactInfo: {
                phoneNumber: contactInfo.phoneNumber,
                customerEmail: contactInfo.customerEmail,
                supportEmail: contactInfo.supportEmail,
                aboutUs: contactInfo.aboutUs,
                city: contactInfo.city
            }
        });
    } catch (error) {
        console.error('❌ Update Contact Error:', error);
        res.status(500).json({ error: 'Server error while updating contact info' });
    }
};


  

// Render Settings Page
exports.renderSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const contactInfo = await ContactInfo.findOne({}).lean(); // Fetch contact details

    // Fetch shipping and tax settings from ShippingSettings (or use defaults if none exist)
    let shippingSettings = await ShippingSettings.findOne().lean() || {
      shippingOption: 'free', // Default to free shipping
      shippingRate: 0,       // Default shipping rate
      taxRate: 0,           // Default tax rate
    };

    // Render the settings page with user, contact, and shipping/tax data
    res.render("admin/setting", {
      user: user || {},
      contactInfo: contactInfo || {}, // Pass empty object if no contact exists
      shippingSettings: shippingSettings, // Pass shipping and tax settings
      error: null,
      passwordError: null,
      passwordSuccess: null,
      successMessage: null
    });
  } catch (error) {
    console.error("❌ Render Settings Error:", error);
    res.status(500).send("Server error");
  }
};

// Add this to your controllers file (e.g., adminController.js)

// Update Shipping and Tax Settings
exports.updateShippingTax = async (req, res) => {
  try {
      const { shippingOption, shippingRate, taxRate } = req.body;

      // Validate input
      if (!shippingOption || (shippingOption !== 'free' && shippingOption !== 'rate')) {
          return res.status(400).json({ error: 'Invalid shipping option' });
      }
      if (typeof shippingRate !== 'number' || shippingRate < 0) {
          return res.status(400).json({ error: 'Invalid shipping rate' });
      }
      if (typeof taxRate !== 'number' || taxRate < 0) {
          return res.status(400).json({ error: 'Invalid tax rate' });
      }

      // Find existing settings or create new
      let shippingSettings = await ShippingSettings.findOne();
      
      if (shippingSettings) {
          // Update existing settings
          shippingSettings.shippingOption = shippingOption;
          shippingSettings.shippingRate = shippingOption === 'rate' ? shippingRate : 0;
          shippingSettings.taxRate = taxRate;
          await shippingSettings.save();
      } else {
          // Create new settings
          shippingSettings = await ShippingSettings.create({
              shippingOption,
              shippingRate: shippingOption === 'rate' ? shippingRate : 0,
              taxRate
          });
      }

      res.status(200).json({
          message: 'Shipping and tax settings updated successfully',
          shippingSettings: {
              shippingOption: shippingSettings.shippingOption,
              shippingRate: shippingSettings.shippingRate,
              taxRate: shippingSettings.taxRate
          }
      });
  } catch (error) {
      console.error('❌ Update Shipping/Tax Error:', error);
      res.status(500).json({ error: 'Server error while updating settings' });
  }
};

exports.getShippingSettings = async (req, res) => {
  try {
    const settings = await ShippingSettings.findOne() || {
      shippingOption: 'free',
      shippingRate: 0,
      taxRate: 0
    };
    res.json(settings);
  } catch (error) {
    console.error('❌ Get Shipping Settings Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reply to contact
exports.replyToContact = async (req, res) => {
  try {
    const { contactId, replyMessage, email } = req.body;

    // Validate input
    if (!contactId || !replyMessage || !email) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID, reply message, and email are required'
      });
    }

    // Find the contact in the database
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Prepare email content
    const subject = `Response to Your Contact Request`;
    const html = `
      <h2>Hello ${contact.name},</h2>
      <p>We have received your message:</p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
        ${contact.message}
      </blockquote>
      <p>Our response:</p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
        ${replyMessage}
      </div>
      <p>Best regards,<br>The Admin Team</p>
    `;

    // Send email using the utility function
    await sendEmail(email, subject, html);

    // Update contact status in database
    contact.replyStatus = 'replied';
    contact.replyMessage = replyMessage;
    contact.replyDate = new Date();
    await contact.save();

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    console.error('Error in replyToContact:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reply',
      error: error.message
    });
  }
};