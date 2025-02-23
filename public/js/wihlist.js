document.addEventListener("DOMContentLoaded", function () {
    const largeScreenWishlistIcon = document.querySelector("#largeScreenWishlist");
    const largeScreenWishlistQuantity = largeScreenWishlistIcon.querySelector("span");
    const smallScreenWishlistIcon = document.querySelector("#smallScreenWishlist");
    const smallScreenWishlistQuantity = smallScreenWishlistIcon.querySelector("span");

    // Function to update wishlist quantity
    function updateWishlistQuantity(quantity) {
        largeScreenWishlistQuantity.textContent = quantity;
        smallScreenWishlistQuantity.textContent = quantity;
    }

    // Load wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    updateWishlistQuantity(wishlist.length);

    // Function to handle wishlist click (add to wishlist)
    function handleWishlistClick(button, productId) {
        const isInWishlist = button.getAttribute("data-wishlist") === "true";
        const heartIcon = button.querySelector("[data-heart-icon]");
        const tooltip = button.querySelector("span");

        if (isInWishlist) {
            // No action if already in wishlist (heart remains red and no removal)
            return;
        } else {
            // Add to wishlist
            wishlist.push(productId);
            button.setAttribute("data-wishlist", "true");
            heartIcon.classList.add("bi-heart-fill", "text-red-500");
            heartIcon.classList.remove("bi-heart");
            tooltip.textContent = "Added"; // Update tooltip to "Added"

            // Play animation only when adding
            playWishlistAnimation(button);
        }

        // Save updated wishlist to localStorage
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishlistQuantity(wishlist.length);
    }

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
            try {
                const response = await fetch("user/wishlist/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId })
                });

                const data = await response.json();

                if (data.message === "User not authenticated.") {
                    window.location.href = "/auth/login"; // Redirect to login if not authenticated
                } else if (data.success) {
                    handleWishlistClick(button, productId);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    });

    // Function to handle remove wishlist item via AJAX without confirmation
    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-product-id');
            let wishlist = JSON.parse(localStorage.getItem("wishlist")) || []; // Load wishlist from localStorage

            try {
                // Send an AJAX request to remove the item
                const response = await fetch('/user/wishlist/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productId })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Product removed from wishlist.');

                    // Remove the item from the DOM (UI update)
                    e.target.closest('.bg-[#F5F5F5]').remove();

                    // Remove the product from the localStorage wishlist array
                    wishlist = wishlist.filter(id => id !== productId);

                    // Save updated wishlist to localStorage
                    localStorage.setItem("wishlist", JSON.stringify(wishlist));

                    // Update the wishlist quantity in the UI
                    updateWishlistQuantity(wishlist.length);

                    // Update the index page: Remove red heart from the product's wishlist button
                    updateWishlistButtonOnIndexPage(productId, false);
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                console.error('Error removing product from wishlist:', error);
                alert('An error occurred while removing the product.');
            }
        });
    });

    // Function to update wishlist button on the index page (when removing an item from wishlist)
    function updateWishlistButtonOnIndexPage(productId, isAdded) {
        const button = document.querySelector(`[data-product-id="${productId}"]`);
        if (button) {
            const heartIcon = button.querySelector("[data-heart-icon]");
            const tooltip = button.querySelector("span");

            if (isAdded) {
                button.setAttribute("data-wishlist", "true");
                heartIcon.classList.add("bi-heart-fill", "text-red-500");
                heartIcon.classList.remove("bi-heart");
                tooltip.textContent = "Remove";
            } else {
                button.setAttribute("data-wishlist", "false");
                heartIcon.classList.add("bi-heart");
                heartIcon.classList.remove("bi-heart-fill", "text-red-500");
                tooltip.textContent = "Add";
            }
        }
    }

    // Function to update wishlist quantity in the UI
    function updateWishlistQuantity(quantity) {
        const largeScreenWishlistIcon = document.querySelector("#largeScreenWishlist");
        const smallScreenWishlistIcon = document.querySelector("#smallScreenWishlist");

        const largeScreenWishlistQuantity = largeScreenWishlistIcon.querySelector("span");
        const smallScreenWishlistQuantity = smallScreenWishlistIcon.querySelector("span");

        largeScreenWishlistQuantity.textContent = quantity;
        smallScreenWishlistQuantity.textContent = quantity;
    }
});
