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

    // Function to update wishlist button states (heart icon and tooltip)
    function updateWishlistButtons() {
        const wishlist = getWishlist();
        document.querySelectorAll(".wishlist-btn").forEach(button => {
            const productId = button.dataset.productId;
            const heartIcon = button.querySelector("[data-heart-icon]");
            const tooltip = button.querySelector("span");

            if (wishlist.includes(productId)) {
                button.setAttribute("data-wishlist", "true");
                heartIcon.classList.add("bi-heart-fill", "text-red-500");
                heartIcon.classList.remove("bi-heart");
                tooltip.textContent = "Added";
            } else {
                button.setAttribute("data-wishlist", "false");
                heartIcon.classList.remove("bi-heart-fill", "text-red-500");
                heartIcon.classList.add("bi-heart");
                tooltip.textContent = "Add"; // Adjust this to your default tooltip text
            }
        });
    }

    // Initial load
    updateWishlistQuantity();
    updateWishlistButtons();

    // Function to play animation when adding to wishlist
    function playWishlistAnimation(button) {
        if (window.innerWidth <= 768) return;

        const productCard = button.closest(".group");
        if (!productCard) return;

        const { top, left, width, height } = productCard.getBoundingClientRect();
        const iconRect = largeScreenWishlistIcon.getBoundingClientRect();

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

        setTimeout(() => {
            quantityElement.style.top = `${iconRect.top}px`;
            quantityElement.style.left = `${iconRect.left}px`;
            quantityElement.style.opacity = "0";
        }, 10);

        setTimeout(() => {
            quantityElement.remove();
        }, 1000);
    }

    // Initialize wishlist buttons
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        const productId = button.dataset.productId;
        const heartIcon = button.querySelector("[data-heart-icon]");
        const tooltip = button.querySelector("span");

        button.addEventListener("click", async function () {
            const isInWishlist = button.getAttribute("data-wishlist") === "true";
            if (isInWishlist) {
                return;
            } else {
                addToWishlist(productId);
                button.setAttribute("data-wishlist", "true");
                heartIcon.classList.add("bi-heart-fill", "text-red-500");
                heartIcon.classList.remove("bi-heart");
                tooltip.textContent = "Added";
                updateWishlistQuantity();
                playWishlistAnimation(button);
            }

            try {
                const response = await fetch("user/wishlist/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId })
                });

                const data = await response.json();
                if (data.message === "User not authenticated.") {
                    window.location.href = "/auth/login";
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    });

    // // Reinitialize UI when the tab/window regains focus
    // window.addEventListener("focus", () => {
    //     updateWishlistQuantity();
    //     updateWishlistButtons();
    // });

    // Optional: Use visibilitychange for more robust detection
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            updateWishlistQuantity();
            updateWishlistButtons();
        }
    });
});




// import { getWishlist, addToWishlist, updateWishlistQuantity } from './localStorage.js';

// document.addEventListener("DOMContentLoaded", async function () {
//     let largeScreenWishlistIcon, largeScreenWishlistQuantity, smallScreenWishlistIcon, smallScreenWishlistQuantity;

//     // Try to select DOM elements with error handling
//     try {
//         largeScreenWishlistIcon = document.querySelector("#largeScreenWishlist");
//         largeScreenWishlistQuantity = largeScreenWishlistIcon ? largeScreenWishlistIcon.querySelector("span") : null;
//         smallScreenWishlistIcon = document.querySelector("#smallScreenWishlist");
//         smallScreenWishlistQuantity = smallScreenWishlistIcon ? smallScreenWishlistIcon.querySelector("span") : null;
//     } catch (error) {
//         console.error("❌ Error selecting wishlist icons:", error);
//         largeScreenWishlistIcon = null;
//         largeScreenWishlistQuantity = null;
//         smallScreenWishlistIcon = null;
//         smallScreenWishlistQuantity = null;
//     }

//     let isAuthenticated = null;
//     let lastMessageTime = 0;
//     const messageCooldown = 3000;

//     // Function to update wishlist quantity
//     function updateWishlistQuantity() {
//         try {
//             const wishlist = getWishlist();
//             if (largeScreenWishlistQuantity) largeScreenWishlistQuantity.textContent = wishlist.length;
//             if (smallScreenWishlistQuantity) smallScreenWishlistQuantity.textContent = wishlist.length;
//         } catch (error) {
//             console.error("❌ Error updating wishlist quantity:", error);
//         }
//     }

//     // Function to update wishlist button states
//     function updateWishlistButtons() {
//         try {
//             const wishlist = getWishlist();
//             const buttons = document.querySelectorAll(".wishlist-btn");
//             buttons.forEach(button => {
//                 const productId = button.dataset.productId;
//                 const heartIcon = button.querySelector("[data-heart-icon]");
//                 const tooltip = button.querySelector("span");

//                 if (!heartIcon || !tooltip) {
//                     console.warn(`Missing heartIcon or tooltip for button with productId: ${productId}`);
//                     return;
//                 }

//                 if (wishlist.includes(productId)) {
//                     button.setAttribute("data-wishlist", "true");
//                     heartIcon.classList.add("bi-heart-fill", "text-red-500");
//                     heartIcon.classList.remove("bi-heart");
//                     tooltip.textContent = "Added";
//                 } else {
//                     button.setAttribute("data-wishlist", "false");
//                     heartIcon.classList.remove("bi-heart-fill", "text-red-500");
//                     heartIcon.classList.add("bi-heart");
//                     tooltip.textContent = "Add";
//                 }
//             });
//         } catch (error) {
//             console.error("❌ Error updating wishlist buttons:", error);
//         }
//     }

//     // Function to show popup message
//     function showPopupMessage(text, type = "error") {
//         try {
//             const now = Date.now();
//             if (now - lastMessageTime < messageCooldown) return;

//             lastMessageTime = now;

//             const popup = document.createElement("div");
//             popup.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white font-semibold text-center ${type === "error" ? "bg-red-600" : "bg-green-600"}`;
//             popup.textContent = text;
//             popup.style.maxWidth = "400px";
//             popup.style.transition = "opacity 0.5s ease-in-out";

//             document.body.appendChild(popup);

//             setTimeout(() => {
//                 popup.style.opacity = "1";
//             }, 10);

//             setTimeout(() => {
//                 popup.style.opacity = "0";
//                 setTimeout(() => {
//                     popup.remove();
//                 }, 500);
//             }, 3000);
//         } catch (error) {
//             console.error("❌ Error showing popup message:", error);
//         }
//     }

//     // Function to play animation when adding to wishlist
//     function playWishlistAnimation(button) {
//         try {
//             if (window.innerWidth <= 768) return;

//             const productCard = button.closest(".group");
//             if (!productCard || !largeScreenWishlistIcon) {
//                 console.warn("❌ Missing product card or wishlist icon for animation");
//                 return;
//             }

//             const { top, left, width, height } = productCard.getBoundingClientRect();
//             const iconRect = largeScreenWishlistIcon.getBoundingClientRect();

//             const quantityElement = document.createElement("div");
//             quantityElement.textContent = "+1";
//             quantityElement.style.position = "fixed";
//             quantityElement.style.top = `${top + height / 2}px`;
//             quantityElement.style.left = `${left + width / 2}px`;
//             quantityElement.style.fontSize = "16px";
//             quantityElement.style.color = "white";
//             quantityElement.style.backgroundColor = "red";
//             quantityElement.style.padding = "5px 10px";
//             quantityElement.style.borderRadius = "50%";
//             quantityElement.style.fontWeight = "bold";
//             quantityElement.style.transition = "all 1s ease-in-out";
//             quantityElement.style.zIndex = "1001";
//             document.body.appendChild(quantityElement);

//             setTimeout(() => {
//                 quantityElement.style.top = `${iconRect.top}px`;
//                 quantityElement.style.left = `${iconRect.left}px`;
//                 quantityElement.style.opacity = "0";
//             }, 10);

//             setTimeout(() => {
//                 quantityElement.remove();
//             }, 1000);
//         } catch (error) {
//             console.error("❌ Error playing wishlist animation:", error);
//         }
//     }

//     // Initial load
//     updateWishlistQuantity();
//     updateWishlistButtons();

//     // Initialize wishlist buttons
//     try {
//         const buttons = document.querySelectorAll(".wishlist-btn");
//         buttons.forEach(button => {
//             const productId = button.dataset.productId;
//             let heartIcon, tooltip;

//             try {
//                 heartIcon = button.querySelector("[data-heart-icon]");
//                 tooltip = button.querySelector("span");
//                 if (!heartIcon || !tooltip) throw new Error("Missing heart icon or tooltip");
//             } catch (error) {
//                 console.warn(`❌ Error selecting elements for button with productId: ${productId}`, error);
//                 return;
//             }

//             button.addEventListener("click", async function () {
//                 const isInWishlist = button.getAttribute("data-wishlist") === "true";

//                 if (isInWishlist) {
//                     return;
//                 }

//                 try {
//                     const response = await fetch("/user/wishlist/add", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ productId }),
//                     });

//                     const data = await response.json();

//                     if (response.status === 401) {
//                         // Not authenticated
//                         isAuthenticated = false;
//                         showPopupMessage(data.message || "Please log in to save your wishlist.");
//                     } else if (data.success) {
//                         // Authenticated and successful
//                         isAuthenticated = true;
//                         addToWishlist(productId);
//                         button.setAttribute("data-wishlist", "true");
//                         heartIcon.classList.add("bi-heart-fill", "text-red-500");
//                         heartIcon.classList.remove("bi-heart");
//                         tooltip.textContent = "Added";
//                         updateWishlistQuantity();
//                         playWishlistAnimation(button);
//                     } else {
//                         // Other server errors
//                         showPopupMessage(data.message || "Failed to add to wishlist.", "error");
//                     }
//                 } catch (error) {
//                     console.error("❌ Fetch Error:", error);
//                     showPopupMessage("Network error. Please try again.", "error");
//                 }
//             });
//         });
//     } catch (error) {
//         console.error("❌ Error initializing wishlist buttons:", error);
//     }

//     // Update UI when tab/window regains focus
//     try {
//         document.addEventListener("visibilitychange", () => {
//             if (document.visibilityState === "visible") {
//                 updateWishlistQuantity();
//                 updateWishlistButtons();
//             }
//         });
//     } catch (error) {
//         console.error("❌ Error adding visibilitychange listener:", error);
//     }
// });