import { getWishlist, addToWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", function () {
    const wishlist = getWishlist();
    updateWishlistQuantity();

    document.querySelectorAll(".wishlist-btn").forEach(button => {
        const productId = button.dataset.productId;
        const heartIcon = button.querySelector("[data-heart-icon]");
        const tooltip = button.querySelector("span");

        // Set initial UI state based on localStorage
        if (wishlist.includes(productId)) {
            button.setAttribute("data-wishlist", "true");
            heartIcon.classList.add("bi-heart-fill", "text-red-500");
            heartIcon.classList.remove("bi-heart");
            tooltip.textContent = "Added";
        } else {
            button.setAttribute("data-wishlist", "false");
        }

        button.addEventListener("click", async function () {
            const isInWishlist = button.getAttribute("data-wishlist") === "true";
            const heartIcon = button.querySelector("[data-heart-icon]");
            const tooltip = button.querySelector("span");

            if (isInWishlist) {
                return; // If the item is already in wishlist, no action needed
            } else {
                // Add item to wishlist
                addToWishlist(productId);
                button.setAttribute("data-wishlist", "true");
                heartIcon.classList.add("bi-heart-fill", "text-red-500");
                heartIcon.classList.remove("bi-heart");
                tooltip.textContent = "Added"; // Tooltip text should be "Added"
                updateWishlistQuantity();
            }

            // Sync changes with the server
            try {
                const response = await fetch("user/wishlist/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId })
                });

                const data = await response.json();

                if (data.message === "User not authenticated.") {
                    window.location.href = "/auth/login"; // Redirect to login if not authenticated
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    });
});
