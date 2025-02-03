const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secretKey } = require("../config/jwtConfig");

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.redirect("/auth/login"); // ✅ Redirect to Login if No Token Found
        }

        const decoded = jwt.verify(token, secretKey);
        const user = await User.findOne({ _id: decoded.userId, "tokens.token": token });

        if (!user) {
            res.clearCookie("authToken"); // ✅ Remove invalid token from cookies
            return res.redirect("/auth/login"); // ✅ Redirect to login if user is deleted
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie("authToken"); // ✅ Remove invalid token from cookies
        return res.redirect("/auth/login"); // ✅ Redirect to Login if Token is Invalid
    }
};

module.exports = verifyToken;
