// public/js/cart.js
import { addToCart, updateCartQuantity } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", function () {
  try {
    // Cart Icon and Quantity Elements
    const cart_Icon = document.getElementById('js-cart');
    const cart_Qunatity = cart_Icon ? cart_Icon.querySelector('#js-cart-qunatiy') : null;

    if (!cart_Icon || !cart_Qunatity) {
      console.warn("Cart icon or quantity element not found, skipping cart functionality.");
      return; // Exit if critical elements are missing
    }

    // Initialize cart quantity on page load
    updateCartQuantity();

    // Handle Add to Cart from Product Cards
    const cartButtons = document.querySelectorAll(".add-to-cart-btn");
    if (cartButtons.length === 0) {
      console.warn("No add-to-cart buttons found on product cards, skipping setup.");
    } else {
      cartButtons.forEach(button => {
        button.addEventListener("click", function () {
          try {
            const productId = this.dataset.productId;

            if (!productId) {
              console.error("Product ID not found in add-to-cart button data.");
              alert("Error: Product ID missing.");
              return;
            }

            // Send AJAX request to server to add to cart
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
                // Add to cart locally with price from server (if provided)
                const price = data.price || 0; // Adjust based on your server response
                addToCart(productId, 1, price);

                // Update cart quantity in UI
                updateCartQuantity();

                // Optional: Show success message
                alert("Item added to cart!");
              } else {
                console.error("Server error adding to cart from product card:", data.message);
                alert(data.message || "Failed to add item to cart.");
              }
            })
            .catch(error => console.error("Error adding to cart from product card:", error));
          } catch (error) {
            console.error("Error in cart button click handler for product card:", error);
          }
        });
      });
    }

    // Handle Add to Cart from Quick View Modal
    const addToCartModalBtn = document.querySelector(".add-to-cart-btn-modal");
    if (addToCartModalBtn) {
      addToCartModalBtn.addEventListener("click", function () {
        try {
          const productName = document.getElementById("modalProductName").textContent;
          const quickViewBtn = document.querySelector(`.quick-view-btn[data-name="${productName}"]`);
          
          if (!quickViewBtn) {
            console.error("Quick view button not found for current product name:", productName);
            alert("Error: Product not found in quick view.");
            return;
          }

          const productId = quickViewBtn.getAttribute("data-product-id");

          if (!productId) {
            console.error("Product ID not found in quick view button data for product:", productName);
            alert("Error: Product ID missing in quick view.");
            return;
          }

          // Send AJAX request to server to add to cart
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
              // Add to cart locally with price from server (if provided)
              const price = data.price || 0; // Adjust based on your server response
              addToCart(productId, 1, price);

              // Update cart quantity in UI
              updateCartQuantity();

              // Close the modal
              closeQuickView();

              // Optional: Show success message
              alert("Item added to cart!");
            } else {
              console.error("Server error adding to cart from quick view:", data.message);
              alert(data.message || "Failed to add item to cart.");
            }
          })
          .catch(error => console.error("Error adding to cart from quick view:", error));
        } catch (error) {
          console.error("Error in add to cart from quick view modal:", error);
        }
      });
    } else {
      console.warn("Add to cart button in quick view modal not found.");
    }

    // Close Quick View Function
    function closeQuickView() {
      try {
        const modal = document.getElementById("quickViewModal");
        modal.classList.remove("opacity-100", "pointer-events-auto");
        modal.classList.add("opacity-0", "pointer-events-none");
        modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-100');
        modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-95');
        document.body.style.overflow = 'auto';
      } catch (error) {
        console.error("Error closing quick view modal:", error);
      }
    }

    // Re-sync cart quantity when returning to the page
    window.addEventListener("focus", () => {
      try {
        updateCartQuantity();
      } catch (error) {
        console.error("Error updating cart quantity on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing cart functionality:", error);
  }
});