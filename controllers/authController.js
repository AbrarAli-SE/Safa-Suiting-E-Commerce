const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require('../utils/emailConfig');
const { secretKey, expiresIn } = require("../config/jwtConfig");

// Generate OTP Function
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Function to Generate Secure Random Password
const generateRandomPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()-_=+<>?";
    
    const allCharacters = uppercase + lowercase + numbers + specialChars;
    let password = "";

    // ✅ Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // ✅ Fill remaining characters randomly (length 10)
    for (let i = 4; i < 10; i++) { 
        password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    // ✅ Shuffle the password to avoid predictable patterns
    return password.split("").sort(() => 0.5 - Math.random()).join("");
};



exports.renderRegisterPage = (req, res) => {
    res.render("auth/register");
};

exports.renderLoginPage = (req, res) => {
    res.render("auth/login");
};

exports.renderForgotPasswordPage = (req, res) => {
    res.render("auth/forgot-password");
};





// ✅ Google Authentication Route
exports.googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

// ✅ Google Authentication Callback
exports.googleAuthCallback = (req, res, next) => {
    passport.authenticate("google", { failureRedirect: "/auth/login" }, async (err, user) => {
        if (err || !user) {
            console.error("Google Authentication Failed:", err);
            return res.redirect("/auth/login");
        }

        try {
            // ✅ Set cookie for session (Ensure token is correctly assigned)
            res.cookie("authToken", user.token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });

            console.log("✅ Google Authentication Successful! User:", user);

            // ✅ Redirect user based on role
            if (user.role === "admin") {
                res.redirect("/admin");
            } else {
                res.redirect("/dashboard");
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            res.redirect("/auth/login");
        }
    })(req, res, next);
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // ✅ Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // ✅ Check if the user is verified
        if (!user.verified) {
            return res.status(400).json({ error: "Account not verified. Please verify your email with OTP." });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            secretKey,
            { expiresIn }
        );

        // ✅ Store token in MongoDB
        user.tokens.push({ token });
        await user.save();

        // ✅ Store JWT in HTTP-only Cookie
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: false, // Set `true` in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000 // Token expires in 24 hours
        });

        // ✅ Redirect user based on role
        const redirectRoute = user.role === "admin" ? "/admin" : "/dashboard";

        res.json({ success: true, message: "Login successful", token, redirectRoute });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error." });
    }
};


// ✅ Register User & Send OTP
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // ✅ OTP expires in 5 minutes
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Get admin emails from .env
        const adminEmails = process.env.ADMIN_EMAILS.split(",");
        const role = adminEmails.includes(email) ? "admin" : "user"; // ✅ Assign role dynamically

        const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires, role });
        await newUser.save();

        // ✅ Send OTP email
        try {
            const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;
            await sendEmail(email, "Verify Your OTP", html);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return res.status(500).json({ error: "Failed to send OTP. Please try again later." });
        }

        res.status(200).json({ success: true, message: "User registered. OTP sent to email." });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Server error." });
    }
};

// ✅ Verify OTP & Generate JWT
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        // ✅ Check if OTP is correct & not expired
        if (user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP. Please try again." });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ error: "OTP expired. Please request a new one." });
        }

        user.verified = true;
        user.otp = null;
        user.otpExpires = null;

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            secretKey,
            { expiresIn }
        );

        user.tokens.push({ token });
        await user.save();

        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });

        res.json({ success: true, message: "Verification successful", token, role: user.role });

    } catch (err) {
        console.error("OTP Verification Error:", err);
        res.status(500).json({ error: "Server error." });
    }
};

// ✅ Resend OTP Function
exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        // ✅ If the user is already verified, no need to resend OTP
        if (user.verified) {
            return res.status(400).json({ error: "User is already verified. Please login." });
        }

        // ✅ Generate a new OTP
        const newOtp = generateOTP();
        user.otp = newOtp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        await user.save();

        // ✅ Send OTP email
        try {
            const html = `<p>Your new OTP is: <strong>${newOtp}</strong></p>`;
            await sendEmail(email, "Your New OTP", html);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return res.status(500).json({ error: "Failed to send new OTP. Please try again later." });
        }

        res.status(200).json({ success: true, message: "A new OTP has been sent to your email." });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ error: "Server error." });
    }
};

// ✅ Logout (Remove JWT & Redirect)
exports.logout = async (req, res) => {
    try {
        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            // ✅ If it's a direct link logout, redirect immediately
            return res.clearCookie("authToken").redirect("/");
        }

        const user = await User.findOneAndUpdate(
            { "tokens.token": token },
            { $pull: { tokens: { token } } },
            { new: true }
        );

        if (!user) {
            return res.status(401).json({ error: "Invalid session" });
        }

        res.clearCookie("authToken");

        // ✅ Handle Logout for Direct Requests vs AJAX Calls
        if (req.headers.accept && req.headers.accept.includes("application/json")) {
            res.json({ success: true, message: "Logged out successfully" });
        } else {
            res.redirect("/");
        }
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
};




// ✅ Forgot Password Controller
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // ✅ Generate New Secure Password
        const newPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        // ✅ Send Email with New Password
        try {
            const html = `<p>Your new password is: <strong>${newPassword}</strong></p>`;
            await sendEmail(email, "Password Reset", html);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return res.status(500).json({ error: "Failed to send email. Please try again later." });
        }

        res.json({ success: true, message: "New password sent to email" });
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};