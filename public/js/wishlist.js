// public/js/wishlist.js
import { addToWishlist, getWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const wishlistIcon = document.getElementById('js-wishlist');
    const wishlistQuantity = wishlistIcon ? wishlistIcon.querySelector('#js-wishlist-quantity') : null;

    if (!wishlistIcon || !wishlistQuantity) {
      console.warn("Wishlist elements not found, skipping functionality.");
      return;
    }

    // Initial updates
    await updateWishlistQuantity();
    updateWishlistButtons();

    // Quick View buttons
    const quickViewButtons = document.querySelectorAll(".quick-view-btn");
    quickViewButtons.forEach(button => {
      button.addEventListener("click", function () {
        try {
          const productId = this.dataset.productId;
          const modal = document.getElementById("quickViewModal");
          const addToWishlistModalBtn = modal.querySelector(".wishlist-btn-modal");

          if (!productId) {
            console.error("Product ID not found.");
            return;
          }

          addToWishlistModalBtn.dataset.productId = productId;
          updateButtonState(addToWishlistModalBtn, isProductInWishlist(productId)); // Set initial state

          // Fill modal content
          document.getElementById("modalProductName").textContent = this.dataset.name || "Unknown Product";
          document.getElementById("modalProductImage").src = this.dataset.image || "";
          document.getElementById("modalProductPrice").textContent = `Rs ${this.dataset.price || '0'}`;
          document.getElementById("modalProductOldPrice").textContent = `Rs ${this.dataset.discountprice || '0'}`;
          document.getElementById("modalProductDesc").textContent = this.dataset.description || "No description available.";

          showModal(modal);
        } catch (error) {
          console.error("Error in quick view:", error);
        }
      });
    });

    // Card wishlist buttons
    const wishlistButtons = document.querySelectorAll(".wishlist-btn");
    wishlistButtons.forEach(button => {
      button.addEventListener("click", async function () {
        await handleWishlistToggle(this);
      });
    });

    // Modal wishlist button
    const addToWishlistModalBtn = document.querySelector(".wishlist-btn-modal");
    if (addToWishlistModalBtn) {
      addToWishlistModalBtn.addEventListener("click", async function () {
        await handleWishlistToggle(this);
        closeQuickView();
      });
    }

    // Close modal
    const closeModalBtn = document.querySelector("#quickViewModal button[onclick='closeQuickView()']");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeQuickView);
    }

    // Helper Functions
    async function handleWishlistToggle(button) {
      try {
        const productId = button.dataset.productId;
        const isInWishlist = isProductInWishlist(productId);

        if (isInWishlist) return;

        if (!productId) {
          console.error("Product ID missing.");
          alert("Error: Product ID missing.");
          return;
        }

        const response = await fetch("/user/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        });
        const data = await response.json();

        if (data.message === "Please log in to modify your wishlist.") {
          window.location.href = '/auth/login';
        } else if (data.success) {
          await addToWishlist(productId);
          updateAllButtonsForProduct(productId, true);
          await updateWishlistQuantity();
          alert("Item added to wishlist!");
        } else {
          alert(data.message || "Failed to add item to wishlist.");
        }
      } catch (error) {
        console.error("Error in wishlist toggle:", error);
      }
    }

    function isProductInWishlist(productId) {
      const wishlist = getWishlist();
      const item = wishlist.find(item => item.productId === productId);
      return item && item.isInWishlist;
    }

    function updateAllButtonsForProduct(productId, isInWishlist) {
      document.querySelectorAll(`.wishlist-btn[data-product-id="${productId}"], 
        .wishlist-btn-modal[data-product-id="${productId}"]`).forEach(button => {
        updateButtonState(button, isInWishlist);
      });
    }

    function updateWishlistButtons() {
      const wishlist = getWishlist();
      document.querySelectorAll(".wishlist-btn, .wishlist-btn-modal").forEach(button => {
        const productId = button.dataset.productId;
        const isInWishlist = wishlist.some(item => item.productId === productId && item.isInWishlist);
        updateButtonState(button, isInWishlist);
      });
    }

    function updateButtonState(button, isInWishlist) {
      button.setAttribute("data-wishlist", isInWishlist);
      const heartIcon = button.querySelector("i");
      if (heartIcon) {
        heartIcon.classList.remove("bi-heart", "bi-heart-fill", "text-[var(--color-red-500)]");
        heartIcon.classList.add(isInWishlist ? "bi-heart-fill" : "bi-heart");
        if (isInWishlist) {
          heartIcon.classList.add("text-[var(--color-red-500)]");
        }
      }
    }

    function showModal(modal) {
      modal.classList.remove("opacity-0", "pointer-events-none");
      modal.classList.add("opacity-100", "pointer-events-auto");
      modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.remove('scale-95');
      modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.add('scale-100');
      document.body.style.overflow = 'hidden';
    }

    function closeQuickView() {
      const modal = document.getElementById("quickViewModal");
      modal.classList.remove("opacity-100", "pointer-events-auto");
      modal.classList.add("opacity-0", "pointer-events-none");
      modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.remove('scale-100');
      modal.querySelector('.bg-\\[var\\(--color-white\\)\\]').classList.add('scale-95');
      document.body.style.overflow = 'auto';
    }

    window.addEventListener("focus", async () => {
      await updateWishlistQuantity();
      updateWishlistButtons();
    });

  } catch (error) {
    console.error("Error initializing wishlist:", error);
  }
});