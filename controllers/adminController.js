// const User = require("../models/User");
// const bcrypt = require("bcryptjs");

// ✅ Render Admin Dashboard
exports.renderAdminDashboard = async (req, res) => {
    try {
        // Render dashboard with user data and messages
        res.render("admin/intro", { 
            user: req.user, 
            error: null,
            passwordError:null,
            passwordSuccess: null
        });
    } catch (error) {
        console.error("❌ Dashboard Error:", error);
        res.status(500).send("Server error");
    }
};


