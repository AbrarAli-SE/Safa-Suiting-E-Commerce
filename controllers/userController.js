const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ Render User Dashboard
exports.renderDashboard = async (req, res) => {
    try {
        // Render dashboard with user data and messages
        res.render("user/dashboard", { 
            user: req.user, 
            error: null,
            passwordError:null,
            passwordSuccess: null,
            successMessage: null

        });
    } catch (error) {
        console.error("❌ Dashboard Error:", error);
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
            return res.status(404).render("user/dashboard", { 
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
                return res.status(400).render("user/dashboard", { 
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
         return res.render("user/dashboard", { 
            user, 
            error: null,
            passwordError: null,
            passwordSuccess:null,
            successMessage: "Profile updated successfully!" // ✅ Success message
        });

    } catch (error) {
        console.error("❌ Profile Update Error:", error);
        return res.status(500).render("user/dashboard", { 
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
            return res.render("user/dashboard", { 
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
            return res.render("user/dashboard", { 
                user, 
                error: null,
                passwordError: "Current password is incorrect.", 
                passwordSuccess: null,
                successMessage: null // ✅ Ensure success message is set to null 
            });
        }

        // ✅ Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.render("user/dashboard", { 
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
        return res.render("user/dashboard", { 
            user, 
            error: null,
            passwordError: null, 
            passwordSuccess: "Password changed successfully!",
            successMessage: null // ✅ Ensure success message is set to null 
        });

    } catch (error) {
        console.error("❌ Password Change Error:", error);
        return res.render("user/dashboard", { 
            user, 
            error: null,
            passwordError: "Server error. Try again.", 
            passwordSuccess: null,
            successMessage: null // ✅ Ensure success message is set to null 
        });
    }
};


