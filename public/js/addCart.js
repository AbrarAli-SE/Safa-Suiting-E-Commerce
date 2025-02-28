// public/js/cart.js
import { addToCart, updateCartQuantity } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Cart Icon and Quantity Elements
    const cartIcon = document.getElementById('js-cart');
    const cartQuantity = cartIcon ? cartIcon.querySelector('#js-cart-quantity') : null;

    if (!cartIcon || !cartQuantity) {
      console.warn("Cart icon or quantity element not found, skipping cart functionality.");
      return;
    }

    // Initial cart quantity update
    await updateCartQuantity();

    // Handle Quick View button clicks
    const quickViewButtons = document.querySelectorAll(".quick-view-btn");
    if (quickViewButtons.length === 0) {
      console.warn("No quick view buttons found, skipping setup.");
    } else {
      quickViewButtons.forEach(button => {
        button.addEventListener("click", function () {
          try {
            const productId = this.dataset.productId;
            const modal = document.getElementById("quickViewModal");
            const addToCartModalBtn = modal.querySelector(".add-to-cart-btn-modal");

            if (!productId) {
              console.error("Product ID not found in quick view button data.");
              return;
            }

            addToCartModalBtn.dataset.productId = productId;

            document.getElementById("modalProductName").textContent = this.dataset.name || "Unknown Product";
            document.getElementById("modalProductImage").src = this.dataset.image || "";
            document.getElementById("modalProductPrice").textContent = `Rs ${this.dataset.price || '0'}`;
            document.getElementById("modalProductOldPrice").textContent = `Rs ${this.dataset.discountprice || '0'}`;
            document.getElementById("modalProductDesc").textContent = this.dataset.description || "No description available.";

            modal.classList.remove("opacity-0", "pointer-events-none");
            modal.classList.add("opacity-100", "pointer-events-auto");
            modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.remove('scale-95');
            modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.add('scale-100');
            document.body.style.overflow = 'hidden';
          } catch (error) {
            console.error("Error opening quick view modal:", error);
          }
        });
      });
    }

    // Handle Add to Cart from Product Cards
    const cartButtons = document.querySelectorAll(".add-to-cart-btn");
    if (cartButtons.length === 0) {
      console.warn("No add-to-cart buttons found on product cards, skipping setup.");
    } else {
      cartButtons.forEach(button => {
        button.addEventListener("click", async function () {
          try {
            const productId = this.dataset.productId;
            console.log("Adding productId from product card:", productId); // Logging added here

            if (!productId) {
              console.error("Product ID not found in add-to-cart button data.");
              alert("Error: Product ID missing.");
              return;
            }

            const response = await fetch("/user/cart/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId })
            });
            const data = await response.json();

            if (data.message === "User not authenticated.") {
              window.location.href = '/auth/login';
            } else if (data.success) {
              const price = data.price || 0;
              // const serverProductId = data.productId || productId; // Use server-provided ID if available
              console.log("Server response for product card:", data); // Additional logging
              await addToCart(productId, 1, price);
              alert("Item added to cart!");
            } else {
              console.error("Server error adding to cart from product card:", data.message);
              alert(data.message || "Failed to add item to cart.");
            }
          } catch (error) {
            console.error("Error in cart button click handler for product card:", error);
          }
        });
      });
    }

    // Handle Add to Cart from Quick View Modal
    const addToCartModalBtn = document.querySelector(".add-to-cart-btn-modal");
    if (addToCartModalBtn) {
      addToCartModalBtn.addEventListener("click", async function () {
        try {
          const productId = this.dataset.productId;
          console.log("Adding productId from Quick View:", productId); // Logging added here

          if (!productId) {
            console.error("Product ID not found in Quick View modal button data.");
            alert("Error: Product ID missing in quick view.");
            return;
          }

          const response = await fetch("/user/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId })
          });
          const data = await response.json();

          if (data.message === "User not authenticated.") {
            window.location.href = '/auth/login';
          } else if (data.success) {
            const price = data.price || 0;
            console.log("Server response for Quick View:", data); // Additional logging
            await addToCart(productId, 1, price);
            closeQuickView();
            alert("Item added to cart!");
          } else {
            console.error("Server error adding to cart from quick view:", data.message);
            alert(data.message || "Failed to add item to cart.");
          }
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
        modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.remove('scale-100');
        modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.add('scale-95');
        document.body.style.overflow = 'auto';
      } catch (error) {
        console.error("Error closing quick view modal:", error);
      }
    }

    // Add close button functionality
    const closeModalBtn = document.querySelector("#quickViewModal button[onclick='closeQuickView()']");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeQuickView);
    }

    // Re-sync cart quantity on focus
    window.addEventListener("focus", async () => {
      try {
        await updateCartQuantity();
      } catch (error) {
        console.error("Error updating cart quantity on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing cart functionality:", error);
  }
});