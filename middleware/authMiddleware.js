// 
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secretKey } = require("../config/jwtConfig");

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            req.user = null; // ✅ No user if no token
            return next();
        }

        const decoded = jwt.verify(token, secretKey);
        const user = await User.findOne({ _id: decoded.userId, "tokens.token": token });

        if (!user) {
            res.clearCookie("authToken");
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (err) {
        res.clearCookie("authToken");
        req.user = null;
        next();
    }
};

// ✅ Admin Authorization Middleware (Protects `/admin/*` routes)
const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.redirect("/"); // Redirect non-admin users to the home page
        }
        next();
    } catch (err) {
        console.error("❌ Admin Middleware Error:", err);
        res.redirect("/auth/login"); // Redirect to login if something goes wrong
    }
};

// ✅ User Authorization Middleware (Protects `/user/*` routes)
const verifyUser = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/auth/login"); // ✅ Redirect unauthenticated users to login
    }
    next();
};


module.exports = { verifyToken, adminAuth ,verifyUser };
