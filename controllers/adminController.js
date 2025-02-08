const User = require("../models/User");
const bcrypt = require("bcryptjs");



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



exports.renderManageUsers = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 10; // ✅ Number of users per page
        let skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();
        const users = await User.find({}, "name email role").skip(skip).limit(limit);
        

        res.render("admin/manage-users", { 
            user: req.user,   // ✅ Pass logged-in admin user
            users,            // ✅ Pass paginated users
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            errorMessage: null,
            successMessage: null

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

        // ✅ Ensure the role is valid
        if (!["user", "admin"].includes(role)) {
            return res.render("admin/manage-users", {
                users: await User.find(),
                errorMessage: "Invalid role selection.",
                successMessage: null
            });
        }

        // ✅ Prevent Admin from Changing Their Own Role
        if (req.user._id.toString() === userId) {
            return res.render("admin/manage-users", {
                users: await User.find(),
                errorMessage: "You cannot change your own role.",
                successMessage: null
            });
        }

        // ✅ Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.render("admin/manage-users", {
                users: await User.find(),
                errorMessage: "User not found.",
                successMessage: null
            });
        }

        // ✅ Update role and save
        user.role = role;
        await user.save();

        // ✅ Redirect with success message
        return res.render("admin/manage-users", {
            users: await User.find(),
            successMessage: `Role updated successfully for ${user.email}`,
            errorMessage: null
        });

    } catch (error) {
        console.error("❌ Update User Role Error:", error);
        return res.render("admin/manage-users", {
            users: await User.find(),
            errorMessage: "Server error. Please try again.",
            successMessage: null
        });
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