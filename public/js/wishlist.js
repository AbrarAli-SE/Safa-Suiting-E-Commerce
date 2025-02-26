// public/js/wishlist.js
import { addToWishlist, getWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", function () {
  try {
    // Wishlist Icon and Quantity Elements
    const wishlist_Icon = document.getElementById('js-wishlist');
    const wishlist_Qunatity = wishlist_Icon ? wishlist_Icon.querySelector('#js-wishlist-qunatiy') : null;

    if (!wishlist_Icon || !wishlist_Qunatity) {
      console.warn("Wishlist icon or quantity element not found, skipping wishlist functionality.");
      return; // Exit if critical elements are missing
    }

    // Initialize wishlist quantity on page load
    updateWishlistQuantity();

    // Handle Add to Wishlist from Product Cards (or other pages)
    const wishlistButtons = document.querySelectorAll(".wishlist-btn");
    if (wishlistButtons.length === 0) {
      console.warn("No wishlist buttons found on product cards, skipping setup.");
    } else {
      wishlistButtons.forEach(button => {
        button.addEventListener("click", function () {
          try {
            const productId = this.dataset.productId;
            const isInWishlist = this.getAttribute("data-wishlist") === "true";

            if (isInWishlist) {
              // Do nothing if already in wishlist
              return;
            }

            if (!productId) {
              console.error("Product ID not found in wishlist button data for product card.");
              alert("Error: Product ID missing.");
              return;
            }

            console.log("Adding product to wishlist with ID:", productId); // Debug log

            // Send AJAX request to server to add to wishlist
            fetch("/user/wishlist/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId })
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (data.message === "Please log in to modify your wishlist.") {
                window.location.href = '/auth/login';
              } else if (data.success) {
                // Add to wishlist locally
                addToWishlist(productId);

                // Update button state
                this.setAttribute("data-wishlist", "true");
                const heartIcon = this.querySelector("i");
                if (heartIcon) {
                  heartIcon.classList.remove("bi-heart");
                  heartIcon.classList.add("bi-heart-fill", "text-[var(--color-red-500)]");
                }

                // Update wishlist quantity in UI
                updateWishlistQuantity();

                // Optional: Show success message
                alert(data.message || "Item added to wishlist!");
              } else {
                console.error("Server error adding to wishlist from product card:", data.message);
                alert(data.message || "Failed to add item to wishlist.");
              }
            })
            .catch(error => {
              console.error("Error adding to wishlist from product card:", error);
              alert("Network error or server issue. Please try again.");
            });
          } catch (error) {
            console.error("Error in wishlist button click handler for product card:", error);
          }
        });
      });
    }

    // Re-sync wishlist quantity when returning to the page
    window.addEventListener("focus", () => {
      try {
        updateWishlistQuantity();
      } catch (error) {
        console.error("Error updating wishlist quantity on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing wishlist functionality:", error);
  }
});