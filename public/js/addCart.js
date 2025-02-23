// public/js/index.js
import { addToCart, updateCartQuantity } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", function () {
  const largeScreenCartIcon = document.querySelector('#largeScreenCart');
  const largeScreenCartQuantity = largeScreenCartIcon.querySelector('span');
  const smallScreenCartIcon = document.querySelector('#smallScreenCart');
  const smallScreenCartQuantity = smallScreenCartIcon.querySelector('span');

  // Initialize cart quantity on page load
  updateCartQuantity();

  // Handle cart button clicks
  document.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", function () {
      const productId = this.dataset.productId;

      // Send AJAX request to server first to get price and confirm addition
      fetch("/user/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === "User not authenticated.") {
          window.location.href = '/auth/login';
        } else if (data.success) {
          // Add to cart with price from server (if provided)
          const price = data.price || 0; // Adjust based on your server response
          addToCart(productId, 1, price);

          // Animation for large screens
          if (window.innerWidth > 768) {
            const productCard = this.closest('.group');
            const { top, left, width, height } = productCard.getBoundingClientRect();
            const iconRect = largeScreenCartIcon.getBoundingClientRect();

            const quantityElement = document.createElement('div');
            quantityElement.textContent = "+1";
            quantityElement.style.position = 'fixed';
            quantityElement.style.top = `${top + height / 2}px`;
            quantityElement.style.left = `${left + width / 2}px`;
            quantityElement.style.fontSize = '16px';
            quantityElement.style.color = 'white';
            quantityElement.style.backgroundColor = 'red';
            quantityElement.style.padding = '5px 10px';
            quantityElement.style.borderRadius = '50%';
            quantityElement.style.fontWeight = 'bold';
            quantityElement.style.transition = 'all 1s ease-in-out';
            quantityElement.style.zIndex = '1001';
            document.body.appendChild(quantityElement);

            setTimeout(() => {
              quantityElement.style.top = `${iconRect.top}px`;
              quantityElement.style.left = `${iconRect.left}px`;
              quantityElement.style.opacity = '0';
            }, 10);

            setTimeout(() => {
              quantityElement.remove();
            }, 1000);
          }
        }
      })
      .catch(error => console.error("Error:", error));
    });
  });

  // Re-sync cart quantity when returning to the index page
  window.addEventListener("focus", () => {
    updateCartQuantity();
  });
});