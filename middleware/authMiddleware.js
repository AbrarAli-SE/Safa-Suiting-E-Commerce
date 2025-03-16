// 
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/jwtConfig");



const authenticateUser = async (req, res, next) => {
  const token = req.cookies.authToken;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
    } catch (err) {
      req.user = null;
    }
  } else {
    
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