const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require('../utils/emailConfig');
const { secretKey } = require("../config/jwtConfig");
const { generateOtpEmail, generateNewPasswordEmail } = require('../utils/emailTemplates');

// Function to Generate Secure Random Password
const generateRandomPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    
    const allCharacters = uppercase + lowercase + numbers;
    let password = "";

    // Ensure at least one character from each category for security
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Fill remaining characters to reach 10 characters total
    for (let i = 3; i < 10; i++) {
        password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    // Shuffle password to ensure randomness and avoid predictable patterns
    return password.split("").sort(() => 0.5 - Math.random()).join("");
};

// Render Register Page
exports.renderRegisterPage = (req, res) => {
    res.render("auth/register"); // Display the registration form
};

// Render OTP Verification Page
exports.renderOtpPage = (req, res) => {
    // Check if temporary user session exists before showing OTP page
    if (!req.session.tempUser || !req.session.tempUser.email) {
        return res.redirect("/auth/register"); // Redirect to register if session is invalid
    }
    res.render("auth/verify-otp", { email: req.session.tempUser.email, error: null });
};

// Render Login Page
exports.renderLoginPage = (req, res) => {
    res.render("auth/login", { error: null }); // Show login form with no initial errors
};

// Render Forgot Password Page
exports.renderForgotPasswordPage = (req, res) => {
    res.render("auth/forgot-password", { error: null, success: null }); // Display forgot password form
};

// User Login Handler
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/login", { error: "Invalid email or password." });
        }

        // Verify password matches stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("auth/login", { error: "Invalid email or password." });
        }

        // Check if user has verified their email
        if (!user.verified) {
            return res.render("auth/login", { error: "Account not verified. Please verify your email with OTP." });
        }

        // Update user's last active timestamp
        user.lastActive = new Date();
        await user.save();

        // Create JWT token with user details
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token in HTTP-only cookie for security
        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
        // Redirect based on user role
        return res.redirect(user.role === "admin" ? "/admin/analytics" : "/");

    } catch (err) {
        console.error("Login Error:", err);
        res.render("auth/login", { error: "Server error. Please try again later." });
    }
};

// User Registration Handler
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        if (await User.findOne({ email })) {
            return res.render("auth/register", { error: "User already exists." });
        }

        // Generate 6-digit OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt

        // Determine user role based on admin email list
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
        const role = adminEmails.includes(email) ? "admin" : "user";

        // Create new user document
        const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires, role });
        await newUser.save();

        // Store email in session for OTP verification
        req.session.tempUser = { email };

        // Send OTP email using template
        const html = generateOtpEmail({ name, newOtp: otp });
        await sendEmail(email, "Verify Your OTP", html);

        // Redirect to OTP verification page
        return res.redirect(`/auth/verify-otp?email=${email}`);

    } catch (error) {
        console.error("Register Error:", error);
        return res.render("auth/register", { error: "Server error. Please try again." });
    }
};

// OTP Verification Handler
exports.verifyOTP = async (req, res) => {
    // Validate session exists before proceeding
    if (!req.session.tempUser || !req.session.tempUser.email) {
        return res.redirect("/auth/register");
    }

    const email = req.session.tempUser.email;
    const { otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("auth/verify-otp", { email, error: "User not found." });
        }

        // Verify OTP matches and hasn't expired
        if (user.otp !== otp) {
            return res.render("auth/verify-otp", { email, error: "Invalid OTP. Please try again." });
        }
        if (user.otpExpires < Date.now()) {
            return res.render("auth/verify-otp", { email, error: "OTP expired. Please request a new one." });
        }

        // Mark user as verified and clear OTP fields
        user.verified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        // Clear temporary session data
        req.session.tempUser = null;

        // Generate JWT token for authenticated session
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            secretKey,
            { expiresIn: '24h' }
        );

        // Set token in cookie and redirect based on role
        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
        return res.redirect(user.role === "admin" ? "/admin/analytics" : "/");
    } catch (err) {
        console.error("OTP Verification Error:", err);
        return res.render("auth/verify-otp", { email, error: "Server error. Please try again later." });
    }
};

// Resend OTP Handler
exports.resendOTP = async (req, res) => {
    // Ensure session exists before resending OTP
    if (!req.session.tempUser || !req.session.tempUser.email) {
        return res.redirect("/auth/register");
    }

    const email = req.session.tempUser.email;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("auth/verify-otp", { email, error: "User not found." });
        }

        // Generate and store new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOtp;
        user.otpExpires = new Date(Date.now() + 1 * 60 * 1000); // OTP valid for 1 minute
        await user.save();

        // Send new OTP email using template
        try {
            const html = generateOtpEmail({ name: user.name, newOtp });
            await sendEmail(email, "Your New OTP", html);
        } catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            return res.render("auth/verify-otp", { email, error: "Failed to send new OTP. Please try again later." });
        }

        // Show success message on OTP verification page
        return res.render("auth/verify-otp", { email, success: "A new OTP has been sent to your email." });

    } catch (error) {
        console.error("❌ Resend OTP Error:", error);
        return res.render("auth/verify-otp", { email, error: "Server error. Please try again later." });
    }
};

// Logout Handler
exports.logout = async (req, res) => {
    try {
        // Clear authentication cookie and redirect to homepage
        res.clearCookie("authToken");
        res.redirect("/");
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
};

// Forgot Password Handler
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/forgot-password", { error: "User not found.", success: null });
        }

        // Generate and hash new password
        const newPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        // Send new password email using template
        try {
            const html = generateNewPasswordEmail({ name: user.name, newPassword });
            await sendEmail(email, "Password Reset", html);
        } catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            return res.render("auth/forgot-password", { error: "Failed to send email. Please try again later.", success: null });
        }

        // Display success message
        res.render("auth/forgot-password", { success: "A new password has been sent to your email.", error: null });

    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.render("auth/forgot-password", { error: "Server error. Please try again later.", success: null });
    }
};