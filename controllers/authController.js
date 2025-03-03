const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const sendEmail = require('../utils/emailConfig');
const { secretKey, expiresIn } = require("../config/jwtConfig");

// Generate OTP Function
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
    if (!req.session.tempUser || !req.session.tempUser.email) {
        return res.redirect("/auth/register"); // 🚫 Redirect if no email in session
    }
    res.render("auth/verify-otp", { email: req.session.tempUser.email, error: null });
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






exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("auth/login", { error: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("auth/login", { error: "Invalid email or password." });
        }

        if (!user.verified) {
            return res.render("auth/login", { error: "Account not verified. Please verify your email with OTP." });
        }

        // Update lastActive after successful authentication
        user.lastActive = new Date();
        await user.save();
        // Check for existing guestId and merge cart/wishlist if present
        const guestId = req.cookies.guestId;
        if (guestId) {
            // Merge guest cart
            const guestCart = await Cart.findOne({ guestId });
            if (guestCart) {
                let userCart = await Cart.findOne({ user: user._id });
                if (!userCart) {
                    userCart = new Cart({ user: user._id, items: [], totalPrice: 0 });
                }
                guestCart.items.forEach(guestItem => {
                    const existingItem = userCart.items.find(item => 
                        item.product.toString() === guestItem.product.toString()
                    );
                    if (existingItem) {
                        existingItem.quantity += guestItem.quantity;
                    } else {
                        userCart.items.push(guestItem);
                    }
                });
                userCart.totalPrice = userCart.items.reduce((sum, item) => 
                    sum + item.price * item.quantity, 0
                );
                await userCart.save();
                await Cart.deleteOne({ guestId }); // Remove guest cart
            }

            // Merge guest wishlist
            const guestWishlist = await Wishlist.findOne({ guestId });
            if (guestWishlist) {
                let userWishlist = await Wishlist.findOne({ user: user._id });
                if (!userWishlist) {
                    userWishlist = new Wishlist({ user: user._id, items: [] });
                }
                guestWishlist.items.forEach(guestItem => {
                    const existingItem = userWishlist.items.find(item => 
                        item.product.toString() === guestItem.product.toString()
                    );
                    if (!existingItem) {
                        userWishlist.items.push(guestItem);
                    }
                });
                await userWishlist.save();
                await Wishlist.deleteOne({ guestId }); // Remove guest wishlist
            }

            // Clear the guestId cookie after merging
            res.clearCookie("guestId");
        }

        // Generate and set JWT
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
        return res.redirect(user.role === "admin" ? "/admin/analytical" : "/");

    } catch (err) {
        console.error("Login Error:", err);
        res.render("auth/login", { error: "Server error. Please try again later." });
    }
};

// Register Controller
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.render("auth/register", { error: "User already exists." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
        const role = adminEmails.includes(email) ? "admin" : "user";

        const newUser = new User({ name, email, password: hashedPassword, otp, otpExpires, role });
        await newUser.save();

        req.session.tempUser = { email };

        const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;
        await sendEmail(email, "Verify Your OTP", html);

        return res.redirect(`/auth/verify-otp?email=${email}`);

    } catch (error) {
        console.error("Register Error:", error);
        return res.render("auth/register", { error: "Server error. Please try again." });
    }
};

// Verify OTP Controller
exports.verifyOTP = async (req, res) => {
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

        if (user.otp !== otp) {
            return res.render("auth/verify-otp", { email, error: "Invalid OTP. Please try again." });
        }
        if (user.otpExpires < Date.now()) {
            return res.render("auth/verify-otp", { email, error: "OTP expired. Please request a new one." });
        }

        user.verified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        req.session.tempUser = null;

        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            secretKey,
            { expiresIn: '24h' }
        );

        res.cookie("authToken", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
        return res.redirect(user.role === "admin" ? "/admin/analytical" : "/");
    } catch (err) {
        console.error("OTP Verification Error:", err);
        return res.render("auth/verify-otp", { email, error: "Server error. Please try again later." });
    }
};


// ✅ Resend OTP (No Email in URL)
exports.resendOTP = async (req, res) => {
    if (!req.session.tempUser || !req.session.tempUser.email) {
        return res.redirect("/auth/register"); // 🚫 Redirect if session is missing
    }

    const email = req.session.tempUser.email;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("auth/verify-otp", { email, error: "User not found." });
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
        res.clearCookie("authToken");
        res.redirect("/");
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


exports.getToken = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);  // Assumes the `verifyToken` middleware sets `req.user`
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if the user has tokens and return the last token
      if (!user.tokens || user.tokens.length === 0) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      const latestToken = user.tokens[user.tokens.length - 1].token; // Get the last token from the array
  
      return res.status(200).json({ token: latestToken });
    } catch (error) {
      res.status(500).json({ error: "Error fetching token" });
    }
  };
  
  