const User = require("../models/User");


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
        const users = await User.find({}, "name email role"); // ✅ Get all users

        res.render("admin/manage-users", { 
            user: req.user,  // ✅ Pass logged-in user
            users,           // ✅ Pass users to EJS
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

