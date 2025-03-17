// public/js/checkout.js
import { stripe, card } from './stripeConfig.js';

function initializeCheckout() {
  card.mount('#card-element');

  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const cardElement = document.getElementById('card-element');
  const checkoutForm = document.getElementById('checkoutForm');

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      cardElement.classList.toggle('hidden', radio.value !== 'stripe');
    });
  });

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;

    // Add payment method to form regardless of Stripe or Cash
    const paymentInput = document.createElement('input');
    paymentInput.type = 'hidden';
    paymentInput.name = 'payment';
    paymentInput.value = selectedPayment;
    checkoutForm.appendChild(paymentInput);

    if (selectedPayment === 'stripe') {
      const totalAmountElement = document.querySelector('.total-amount');
      if (!totalAmountElement) {
        document.getElementById('card-errors').textContent = 'Total amount not found.';
        document.getElementById('card-errors').classList.remove('hidden');
        return;
      }

      const totalAmountText = totalAmountElement.textContent.replace('Rs ', '').trim();
      const totalAmount = parseFloat(totalAmountText);

      if (isNaN(totalAmount) || totalAmount <= 0) {
        document.getElementById('card-errors').textContent = 'Invalid total amount.';
        document.getElementById('card-errors').classList.remove('hidden');
        return;
      }

      try {
        const response = await fetch('/user/cart/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalAmount }),
        });

        if (!response.ok) throw new Error('Failed to create payment intent');

        const { clientSecret } = await response.json();
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: card },
        });

        if (error) {
          document.getElementById('card-errors').textContent = error.message;
          document.getElementById('card-errors').classList.remove('hidden');
          return;
        }

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'paymentIntentId';
        hiddenInput.value = paymentIntent.id;
        checkoutForm.appendChild(hiddenInput);
      } catch (err) {
        document.getElementById('card-errors').textContent = err.message;
        document.getElementById('card-errors').classList.remove('hidden');
        return;
      }
    }

    checkoutForm.submit();
  });
}

export { initializeCheckout };
document.addEventListener('DOMContentLoaded', initializeCheckout);