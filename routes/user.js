// routes/user.js
const express = require('express');
const router = express.Router();


// User profile route (protected)
router.get('/account', (req, res,next) => {
  const person = req.user;
  res.render('account', { person });
});

module.exports = router;
