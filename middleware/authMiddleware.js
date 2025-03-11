// 
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/jwtConfig");



const authenticateUser = async (req, res, next) => {
  const token = req.cookies.authToken;
  console.log("Auth Token from Cookie:", token);
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      console.log("Decoded Token:", decoded);
      req.user = decoded;
    } catch (err) {
      console.error("Token Verification Error:", err.message);
      req.user = null;
    }
  } else {
    console.log("No Token Found in Cookies");
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