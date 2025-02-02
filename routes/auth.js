// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/emailConfig');


const router = express.Router();


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
      { id: user._id, email: user.email, role: user.role },  // Payload
      process.env.JWT_SECRET || 'your-jwt-secret',  // Secret key (use env variable)
      { expiresIn: '1h' }  // Expiration time (1 hour in this case)
  );
};

// Serve Register and Login Pages
router.get('/register', (req, res) => {
  res.render('auth/register');
});

  
router.get('/login', (req, res) => {
    res.render('auth/login');
  });
  
router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password');
  });

  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });

        const otp = generateOTP();
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ email, username: email, password: hashedPassword, otp, role: 'user', verified: false });

        await user.save();

        try {
            // Send OTP email
            const html = `<p>Your OTP is: ${otp}</p>`;
            await sendEmail(email, 'Verify Your OTP', html);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return res.status(500).json({ error: 'Failed to send OTP. Please try again later.' });
        }

        try {
            // Generate JWT token
            const token = generateToken(user);
            return res.json({ message: 'OTP sent to email', token });
        } catch (tokenError) {
            console.error("Token generation failed:", tokenError);
            return res.status(500).json({ error: 'Failed to generate authentication token.' });
        }

    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: 'Server error' });
    }
});

  
  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  
      user.verified = true;
      user.otp = null;
      await user.save();
  
      res.json({ message: 'Verification successful' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.json({ token, role: user.role });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'User not found' });
  
      const newPassword = crypto.randomBytes(6).toString('hex');
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      await transporter.sendMail({ to: email, subject: 'Password Reset', text: `Your new password is: ${newPassword}` });
  
      res.json({ message: 'New password sent to email' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  module.exports = router;
  