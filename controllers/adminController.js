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
            users            // ✅ Pass users to EJS
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

