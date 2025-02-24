// 
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secretKey } = require("../config/jwtConfig");

// const verifyToken = async (req, res, next) => {
//     try {
//         const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

//         if (!token) {
//             req.user = null; // ✅ No user if no token
//             return next();
//         }

//         const decoded = jwt.verify(token, secretKey);
//         const user = await User.findOne({ _id: decoded.userId, "tokens.token": token });

//         if (!user) {
//             res.clearCookie("authToken");
//             req.user = null;
//             return next();
//         }

//         req.user = user;
//         next();
//     } catch (err) {
//         res.clearCookie("authToken");
//         req.user = null;
//         next();
//     }
// };

// const jwt = require("jsonwebtoken");


const authenticateUser = async (req, res, next) => {
  const token = req.cookies.authToken;
//   console.log("Auth Token from Cookie:", token); // Debug log

  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      console.log("Decoded Token:", decoded); // Debug log
      req.user = decoded; // { userId, name, email, role }
    } catch (err) {
      console.error("Token Verification Error:", err.message); // Debug log
      req.user = null;
    }
  } else {
    // console.log("No Token Found in Cookies"); // Debug log
    req.user = null;
  }
  next();
};



const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.redirect("/");
  }
  next();
};


// ✅ User Authorization Middleware (Protects `/user/*` routes)
const verifyUser = (req, res, next) => {
    if (!req.user) {
        return res.redirect("/auth/login"); // ✅ Redirect unauthenticated users to login
    }
    next();
};


module.exports = {authenticateUser,  adminAuth ,verifyUser };