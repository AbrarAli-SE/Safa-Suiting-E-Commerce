// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const transporter = require('../config/emailConfig');

const router = express.Router();


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
  
      await transporter.sendMail({ to: email, subject: 'Verify Your OTP', text: `Your OTP is: ${otp}` });
  
      res.json({ message: 'OTP sent to email' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
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
  