// config/stripeConfig.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe; // Export the configured Stripe instance