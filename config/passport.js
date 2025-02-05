const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secretKey } = require("../config/jwtConfig");

// ✅ Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '419808766606-rgltcnck0caaubpmd1kghjopmvtubo9e.apps.googleusercontent.com',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
            callbackURL: "/auth/google/callback",
            passReqToCallback: true, // ✅ Required to pass request
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    // ✅ Register new Google user
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: null, // Google users don't need passwords
                        role: "user",
                        verified: true,
                    });

                    await user.save();
                }

                // ✅ Generate JWT Token for session
                const token = jwt.sign(
                    { userId: user._id, name: user.name, email: user.email, role: user.role },
                    secretKey,
                    { expiresIn: "1d" }
                );

                user.tokens.push({ token });
                await user.save();

                done(null, { id: user._id, token, role: user.role }); // Pass user ID & token
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// ✅ Store user in session
passport.serializeUser((user, done) => {
    done(null, user.id); // Store only the user ID
});

// ✅ Retrieve user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) return done(null, false);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
