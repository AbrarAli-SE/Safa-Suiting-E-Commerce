const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Render the user dashboard page
exports.renderDashboard = async (req, res) => {
    try {
        // Render the dashboard with user data and initial state for messages
        res.render("user/dashboard", {
            user: req.user, // Pass authenticated user from middleware
            error: null, // Initial state: no general error
            passwordError: null, // Initial state: no password-specific error
            passwordSuccess: null, // Initial state: no password success message
            successMessage: null, // Initial state: no general success message
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Dashboard Error:", error);
        res.status(500).send("Server error");
    }
};

// Update user profile information
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from authenticated request (JWT)

        // Fetch the user from the database
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Check if the new email is already in use by another user
        if (user.email !== req.body.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({ error: "Email already in use." });
            }
        }

        // Update user fields with new data
        user.name = req.body.name;
        user.email = req.body.email;
        await user.save();

        // Respond with success message and updated user data
        return res.status(200).json({
            message: "Profile updated successfully!",
            user: { userId: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Profile Update Error:", error);
        return res.status(500).json({ error: "Server error. Try again." });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Fetch the user from the database
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Verify the current password matches the stored hash
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect." });
        }

        // Ensure new password and confirmation match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New passwords do not match." });
        }

        // Hash the new password and update the user record
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Respond with success message
        return res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Password Change Error:", error);
        return res.status(500).json({ error: "Server error. Try again." });
    }
};

// Fetch user profile data for display
exports.getProfileData = async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from authenticated request (JWT)

        // Fetch the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Respond with user profile data
        res.status(200).json({
            user: { userId: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        // Log error for debugging and return a server error response
        console.error("❌ Get Profile Data Error:", error);
        res.status(500).json({ error: "Server error. Try again." });
    }
};