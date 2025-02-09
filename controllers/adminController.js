const User = require("../models/User");
const Contact = require("../models/Contact");
const bcrypt = require("bcryptjs");




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



exports.renderCoursel = async(req, res) =>{
    try {
        res.render("admin/coursel");
    } catch (error) {
        console.error("❌ Cancel Order Error:", error);
        res.status(500).send("Server error");
    }
}


exports.renderManageUsers = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10; // ✅ Number of users per page
        let skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();
        const users = await User.find({}, "name email role").skip(skip).limit(limit);

        res.render("admin/manage-users", { 
            user: req.user,   
            users,            
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            successMessage: req.query.successMessage || null, // ✅ Get success message from query
            errorMessage: req.query.errorMessage || null // ✅ Get error message from query
        });

    } catch (error) {
        console.error("❌ Manage Users Page Error:", error);
        res.status(500).send("Server error");
    }
};




exports.renderUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;
        // console.log("Fetching User ID:", userId); // ✅ Debug Log

        if (!userId || userId.length !== 24) {
            // console.error("❌ Invalid User ID Format:", userId);
            return res.status(400).render("admin/user-details", { error: "Invalid User ID", user: null });
        }

        const user = await User.findById(userId);
        // console.log("Found User:", user); // ✅ Debug Log

        if (!user) {
            console.error("❌ User Not Found for ID:", userId);
            return res.status(404).render("admin/user-details", { error: "User not found", user: null });
        }

        res.render("admin/user-details", { user, error: null });
    } catch (error) {
        console.error("❌ User Details Error:", error);
        res.status(500).render("admin/user-details", { error: "Server error", user: null });
    }
};




// ✅ Update User Role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        let page = req.query.page || 1;

        // ✅ Ensure role is valid
        if (!["user", "admin"].includes(role)) {
            return res.redirect(`/admin/users?page=${page}&errorMessage=Invalid role selection.`);
        }

        // ✅ Prevent admin from changing their own role
        if (req.user._id.toString() === userId) {
            return res.redirect(`/admin/users?page=${page}&errorMessage=You cannot change your own role.`);
        }

        // ✅ Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.redirect(`/admin/users?page=${page}&errorMessage=User not found.`);
        }

        // ✅ Update role and save
        user.role = role;
        await user.save();

        // ✅ Redirect with success message
        return res.redirect(`/admin/users?page=${page}&successMessage=Role updated successfully for ${user.email}`);

    } catch (error) {
        console.error("❌ Update User Role Error:", error);
        return res.redirect(`/admin/users?page=${req.query.page || 1}&errorMessage=Server error. Please try again.`);
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