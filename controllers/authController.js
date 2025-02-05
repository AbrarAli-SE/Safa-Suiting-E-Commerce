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



// ✅ Render Register Page
exports.renderRegisterPage = (req, res) => {
    res.render("auth/register"); // ✅ Corrected Syntax
};


// ✅ Render OTP Verification Page
exports.renderOtpPage = (req, res) => {
    const email = req.query.email || ""; // ✅ Ensure email is passed correctly
    res.render("auth/verify-otp", { email, error: null });
};


// ✅ Render Login Page
exports.renderLoginPage = (req, res) => {
    res.render("auth/login", { error: null });
};

// ✅ Render Forgot Password Page
exports.renderForgotPasswordPage = (req, res) => {
    res.render("auth/forgot-password", { error: null, success: null });
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
                res.redirect("/user/dashboard");
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            res.redirect("/auth/login");
        }
    })(req, res, next);
};


// ✅ Process Login Request
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/login", { error: "Invalid email or password." });
        }

        // ✅ Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("auth/login", { error: "Invalid email or password." });
        }

        // ✅ Check if the user is verified
        if (!user.verified) {
            return res.render("auth/login", { error: "Account not verified. Please verify your email with OTP." });
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
        return res.redirect(user.role === "admin" ? "/admin" : "/");

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.render("auth/login", { error: "Server error. Please try again later." });
    }
};


// ✅ Register User & Redirect to OTP Page
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        console.log("🔹 Registering user:", { name, email });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("auth/register", { error: "User already exists." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
        const role = adminEmails.includes(email) ? "admin" : "user";

        const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires, role });
        await newUser.save();

        console.log("✅ User saved. Sending OTP email...");

        // ✅ Send OTP Email
        try {
            const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;
            await sendEmail(email, "Verify Your OTP", html);
        } catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            return res.render("auth/register", { error: "Failed to send OTP. Please try again later." });
        }

        console.log("✅ Redirecting to OTP page for:", email);
        return res.redirect(`/auth/verify-otp?email=${email}`); // ✅ Use Redirect

    } catch (error) {
        console.error("❌ Register Error:", error);
        return res.render("auth/register", { error: "Server error. Please try again." });
    }
};



// ✅ Verify OTP & Generate JWT
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("auth/verify-otp", { email, error: "User not found." });
        }

        // ✅ Validate OTP
        if (user.otp !== otp) {
            return res.render("auth/verify-otp", { email, error: "Invalid OTP. Please try again." });
        }
        if (user.otpExpires < Date.now()) {
            return res.render("auth/verify-otp", { email, error: "OTP expired. Please request a new one." });
        }

        // ✅ Mark user as verified
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

        // ✅ Set JWT in cookies
        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });

        // ✅ Redirect user to respective dashboard
        return res.redirect(user.role === "admin" ? "/admin" : "/");

    } catch (err) {
        console.error("❌ OTP Verification Error:", err);
        return res.render("auth/verify-otp", { email, error: "Server error. Please try again later." });
    }
};


// ✅ Resend OTP
exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("auth/verify-otp", { email, error: "User not found." });
        }

        // ✅ If user is already verified, redirect to login
        if (user.verified) {
            return res.redirect("/auth/login");
        }

        // ✅ Generate a new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        user.otp = newOtp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        await user.save();

        // ✅ Send OTP email
        try {
            const html = `<p>Your new OTP is: <strong>${newOtp}</strong></p>`;
            await sendEmail(email, "Your New OTP", html);
        } catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            return res.render("auth/verify-otp", { email, error: "Failed to send new OTP. Please try again later." });
        }

        return res.render("auth/verify-otp", { email, success: "A new OTP has been sent to your email." });

    } catch (error) {
        console.error("❌ Resend OTP Error:", error);
        return res.render("auth/verify-otp", { email, error: "Server error. Please try again later." });
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


// ✅ Process Forgot Password Request
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/forgot-password", { error: "User not found.", success: null });
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
            console.error("❌ Email sending failed:", emailError);
            return res.render("auth/forgot-password", { error: "Failed to send email. Please try again later.", success: null });
        }

        // ✅ Show Success Message
        res.render("auth/forgot-password", { success: "A new password has been sent to your email.", error: null });

    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.render("auth/forgot-password", { error: "Server error. Please try again later.", success: null });
    }
};