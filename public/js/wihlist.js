import { getWishlist, addToWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", function () {
    const largeScreenWishlistIcon = document.querySelector("#largeScreenWishlist");
    const largeScreenWishlistQuantity = largeScreenWishlistIcon.querySelector("span");
    const smallScreenWishlistIcon = document.querySelector("#smallScreenWishlist");
    const smallScreenWishlistQuantity = smallScreenWishlistIcon.querySelector("span");

    // Function to update wishlist quantity
    function updateWishlistQuantity() {
        const wishlist = getWishlist();
        largeScreenWishlistQuantity.textContent = wishlist.length;
        smallScreenWishlistQuantity.textContent = wishlist.length;
    }

    // Load wishlist from localStorage
    let wishlist = getWishlist();
    updateWishlistQuantity();

    // Function to play animation when adding to wishlist
    function playWishlistAnimation(button) {
        if (window.innerWidth <= 768) return; // Play animation only on large screens

        const productCard = button.closest(".group");
        if (!productCard) return;

        const { top, left, width, height } = productCard.getBoundingClientRect();
        const targetIcon = largeScreenWishlistIcon;
        const iconRect = targetIcon.getBoundingClientRect();

        // Create the flying "+1" effect
        const quantityElement = document.createElement("div");
        quantityElement.textContent = "+1";
        quantityElement.style.position = "fixed";
        quantityElement.style.top = `${top + height / 2}px`;
        quantityElement.style.left = `${left + width / 2}px`;
        quantityElement.style.fontSize = "16px";
        quantityElement.style.color = "white";
        quantityElement.style.backgroundColor = "red";
        quantityElement.style.padding = "5px 10px";
        quantityElement.style.borderRadius = "50%";
        quantityElement.style.fontWeight = "bold";
        quantityElement.style.transition = "all 1s ease-in-out";
        quantityElement.style.zIndex = "1001";
        document.body.appendChild(quantityElement);

        // Move towards wishlist icon
        setTimeout(() => {
            quantityElement.style.top = `${iconRect.top}px`;
            quantityElement.style.left = `${iconRect.left}px`;
            quantityElement.style.opacity = "0";
        }, 10);

        // Remove the element after animation
        setTimeout(() => {
            quantityElement.remove();
        }, 1000);
    }

    // Initialize wishlist buttons
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        const productId = button.dataset.productId;
        const heartIcon = button.querySelector("[data-heart-icon]");
        const tooltip = button.querySelector("span");

        // Set initial UI based on localStorage
        if (wishlist.includes(productId)) {
            button.setAttribute("data-wishlist", "true");
            heartIcon.classList.add("bi-heart-fill", "text-red-500");
            heartIcon.classList.remove("bi-heart");
            tooltip.textContent = "Added"; // Tooltip text should be "Added"
        } else {
            button.setAttribute("data-wishlist", "false");
        }

        button.addEventListener("click", async function () {
            const isInWishlist = button.getAttribute("data-wishlist") === "true";
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

                // Play animation when adding to wishlist
                playWishlistAnimation(button);
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
