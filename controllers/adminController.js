const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Contact = require("../models/Contact");
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

      // Map uploaded files to new slides
      const newSlides = req.files.map((file, index) => ({
        image: `/uploads/carousel/${file.filename}`,
        text: req.body[`text${index + 1}`] || "",
        font: req.body[`font${index + 1}`] || "Arial",
        fontSize: parseInt(req.body[`fontSize${index + 1}`]) || 24,
        color: req.body[`color${index + 1}`] || "#FFFFFF",
        opacity: parseFloat(req.body[`opacity${index + 1}`]) || 1.0,
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


// ✅ Fetch Notifications for Admin
exports.getNotifications = async (req, res) => {
    try {
        const newUsersCount = await User.countDocuments({ isNotified: false });
        const newContactsCount = await Contact.countDocuments({ isNotified: false });

        res.json({
            success: true,
            newUsers: newUsersCount,
            newContacts: newContactsCount,
            totalNotifications: newUsersCount + newContactsCount
        });
    } catch (error) {
        console.error("❌ Fetch Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Mark Notifications as Read when Admin Clicks the Bell
exports.markNotificationsAsRead = async (req, res) => {
    try {
        await User.updateMany({ isNotified: false }, { $set: { isNotified: true } });
        await Contact.updateMany({ isNotified: false }, { $set: { isNotified: true } });

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Mark Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


exports.renderContacts = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10; // ✅ Contacts per page
        let skip = (page - 1) * limit;

        const totalContacts = await Contact.countDocuments();
        const contacts = await Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.render("admin/contact-list", {
            user: req.user,
            contacts,
            currentPage: page,
            totalPages: Math.ceil(totalContacts / limit),
        });
    } catch (error) {
        console.error("❌ Error fetching contacts:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Delete Contact Message & Stay on Same Page
exports.deleteContact = async (req, res) => {
    try {
        const { contactId } = req.body;
        const currentPage = req.query.page || 1; // ✅ Get the current page number

        await Contact.findByIdAndDelete(contactId);

        res.redirect(`/admin/contacts?page=${currentPage}`); // ✅ Stay on the same page after deletion
    } catch (error) {
        console.error("❌ Contact Deletion Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Render Admin Dashboard
exports.renderAdminDashboard = async (req, res) => {
    try {
        // Render dashboard with user data and messages
        res.render("admin/intro", { 
            user: req.user, 
        });
    } catch (error) {
        console.error("❌ Dashboard Error:", error);
        res.status(500).send("Server error");
    }
};

exports.renderCouponCode = async(req, res) =>{
    try {
        res.render("admin/CouponCode");
    } catch (error) {
        console.error("❌ CouponCode Error:", error);
        res.status(500).send("Server error");
    }
}


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
      const users = await User.find(query, "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
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







exports.renderAdminSettings = async (req, res) => {
    try {
        // Render dashboard with user data and messages
        res.render("admin/setting", { 
            user: req.user, 
            error: null,
            passwordError:null,
            passwordSuccess: null,
            successMessage: null

        });
    } catch (error) {
        console.error("❌ Setting Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id; // ✅ Get user ID from session or JWT

        // ✅ Find the user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).render("admin/setting", { 
                user, 
                error: "User not found.",
                passwordError: null,
                passwordSuccess: null,
                successMessage: null // ✅ Ensure success message is set to null
            });
        }

        // ✅ Ensure email is unique if changed
        if (user.email !== req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });

            // ✅ If email already exists, show error message
            if (existingUser) {
                return res.status(400).render("admin/setting", { 
                    user, 
                    error: "Email already in use.",
                    passwordError: null,
                    passwordSuccess: null,
                    successMessage: null // ✅ Ensure success message is set to null 
                });
            }
        }

        // ✅ Update user details
        user.name = req.body.name;
        user.email = req.body.email;

        // ✅ Save the updated user
        await user.save();

        
         // ✅ Render Dashboard with Success Message
         return res.render("admin/setting", { 
            user, 
            error: null,
            passwordError: null,
            passwordSuccess:null,
            successMessage: "Profile updated successfully!" // ✅ Success message
        });

    } catch (error) {
        console.error("❌ Profile Update Error:", error);
        return res.status(500).render("admin/setting", { 
            user: req.user, 
            error: "Server error. Try again.",
            passwordError: null,
            passwordSuccess: null,
            successMessage: null // ✅ Ensure success message is set to null
        });
    }
};

// ✅ Change Password Controller
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.render("admin/setting", { 
                user, 
                error: null,
                passwordError: "User not found.", 
                passwordSuccess: null,
                successMessage: null // ✅ Ensure success message is set to null 
            });
        }

        // ✅ Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.render("admin/setting", { 
                user, 
                error: null,
                passwordError: "Current password is incorrect.", 
                passwordSuccess: null,
                successMessage: null // ✅ Ensure success message is set to null 
            });
        }

        // ✅ Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.render("admin/setting", { 
                user, 
                error: null,
                passwordError: "New passwords do not match.", 
                passwordSuccess: null,
                successMessage: null // ✅ Ensure success message is set to null 
            });
        }

        // ✅ Hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // ✅ Redirect with success message
        return res.render("admin/setting", { 
            user, 
            error: null,
            passwordError: null, 
            passwordSuccess: "Password changed successfully!",
            successMessage: null // ✅ Ensure success message is set to null 
        });

    } catch (error) {
        console.error("❌ Password Change Error:", error);
        return res.render("admin/setting", { 
            user, 
            error: null,
            passwordError: "Server error. Try again.", 
            passwordSuccess: null,
            successMessage: null // ✅ Ensure success message is set to null 
        });
    }
};