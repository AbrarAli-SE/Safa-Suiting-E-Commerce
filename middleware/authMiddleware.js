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

module.exports = verifyToken;
