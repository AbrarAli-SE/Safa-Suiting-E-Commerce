// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google Profile:', profile); // Debug log
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = new User({
          email: profile.emails[0].value,
          name: profile.displayName,
          password: null,
          role: 'user',
          verified: true,
          lastActive: new Date()
        });
        await user.save();
        console.log('New user created:', user);
      } else {
        user.lastActive = new Date();
        await user.save();
        console.log('User updated:', user);
      }
      return done(null, user);
    } catch (err) {
      console.error('Passport Google Strategy Error:', err);
      return done(err, null);
    }
  }
), {
    scope: ['openid', 'profile', 'email'] // Updated scope to include openid
});

// Serialize user to session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log('Deserialized user:', user);
    done(null, user);
  } catch (err) {
    console.error('Deserialize Error:', err);
    done(err, null);
  }
});

module.exports = passport;