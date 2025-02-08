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
