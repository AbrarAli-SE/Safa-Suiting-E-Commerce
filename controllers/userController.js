const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.renderDashboard = async (req, res) => {
  try {
    res.render("user/dashboard", {
      user: req.user,
      error: null,
      passwordError: null,
      passwordSuccess: null,
      successMessage: null,
    });
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Match JWT structure from login

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
      user: { userId: user._id, name: user.name, email: user.email, role: user.role },
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