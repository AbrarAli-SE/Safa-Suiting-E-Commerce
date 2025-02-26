// public/js/remove.js
import { getWishlist, removeFromWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", function () {
  try {
    const removeButtons = document.querySelectorAll('.remove-from-wishlist');
    const sliderContainer = document.querySelector('.slider-container');

    // Initial sync with localStorage and UI update
    let wishlist = getWishlist();
    updateWishlistUI();
    updateWishlistButtons(); // New function to restore red heart state on refresh

    // Function to check and update the wishlist UI
    function updateWishlistUI() {
      const wishlist = getWishlist();
      if (wishlist.length === 0 && sliderContainer) {
        // Replace the slider container with the empty message
        sliderContainer.parentElement.innerHTML = `
          <p class="text-[var(--color-gray-600)] text-center mt-10 mb-8 text-lg">Your wishlist is empty. Start adding items!</p>
        `;
      }
    }

    // Function to update wishlist button states (restore red heart state on refresh)
    function updateWishlistButtons() {
      const wishlist = getWishlist();
      document.querySelectorAll(".wishlist-btn").forEach(button => {
        const productId = button.dataset.productId;
        const isInWishlist = wishlist.includes(productId);
        const heartIcon = button.querySelector("i");

        if (isInWishlist) {
          button.setAttribute("data-wishlist", "true");
          if (heartIcon) {
            heartIcon.classList.remove("bi-heart");
            heartIcon.classList.add("bi-heart-fill", "text-[var(--color-red-500)]");
          }
        } else {
          button.setAttribute("data-wishlist", "false");
          if (heartIcon) {
            heartIcon.classList.remove("bi-heart-fill", "text-[var(--color-red-500)]");
            heartIcon.classList.add("bi-heart");
          }
        }
      });
    }

    // Handle Remove from Wishlist button clicks
    removeButtons.forEach(button => {
      button.addEventListener('click', async function () {
        try {
          const productId = this.getAttribute('data-product-id');
          const response = await fetch('/user/wishlist/remove', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
          });

          const result = await response.json();

          if (result.success) {
            // Remove the item from the UI
            this.closest('.group').remove();

            // Remove from localStorage
            removeFromWishlist(productId);

            // Update the wishlist quantity in the UI
            updateWishlistQuantity();

            // Check if the wishlist is empty and update the UI
            updateWishlistUI();

            // Update wishlist button states to reflect removal
            updateWishlistButtons();
          } else {
            alert(result.message || "Error removing item.");
          }
        } catch (error) {
          console.error('Error removing item from wishlist:', error);
          alert('Network error. Please try again.');
        }
      });
    });

    // Initial check in case the wishlist is already empty
    updateWishlistUI();

    // Re-sync wishlist quantity and buttons when returning to the page
    window.addEventListener("focus", () => {
      try {
        updateWishlistQuantity();
        updateWishlistButtons();
      } catch (error) {
        console.error("Error updating wishlist on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing wishlist removal functionality:", error);
  }
});