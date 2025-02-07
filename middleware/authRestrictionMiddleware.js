const authRestrictionMiddleware = {
    // ✅ Restrict access to OTP verification pages unless registering
    restrictOtpAccess: (req, res, next) => {
        if (!req.session.tempUser || !req.session.tempUser.email) {
            return res.redirect("/auth/register"); // 🚫 Redirect if not in OTP process
        }
        next();
    },

    // ✅ Prevent logged-in users from accessing register, login, verify OTP, and resend OTP
    restrictAuthRoutesForLoggedInUsers: (req, res, next) => {
        if (req.user) {
            return res.redirect("/"); // ✅ Redirect logged-in users to home
        }
        next();
    }
};

module.exports = authRestrictionMiddleware;
