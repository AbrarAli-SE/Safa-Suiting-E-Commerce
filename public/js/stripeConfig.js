// public/js/stripeConfig.js
const stripe = Stripe(window.stripePublicKey); // Use the public key passed from server-side
const elements = stripe.elements();

// Create the card element with styling
const card = elements.create('card', {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
    },
  },
});

// Export stripe and card for use in other modules
export { stripe, card };