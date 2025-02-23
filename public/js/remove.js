import { getWishlist, removeFromWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", function () {
    const removeButtons = document.querySelectorAll('.remove-from-wishlist');
    const sliderContainer = document.querySelector('.slider-container');

    // Initial sync with localStorage
    let wishlist = getWishlist();
    updateWishlistQuantity();

    // Function to check and update the wishlist UI
    function updateWishlistUI() {
        const wishlist = getWishlist();
        if (wishlist.length === 0 && sliderContainer) {
            // Replace the slider container with the empty message
            sliderContainer.parentElement.innerHTML = `
                <p class="text-gray-600 text-center mt-10">Your wishlist is empty. Start adding items!</p>
            `;
        }
    }

    removeButtons.forEach(button => {
        button.addEventListener('click', async function () {
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
            } else {
                alert(result.message || "Error removing item.");
            }
        });
    });

    // Initial check in case the wishlist is already empty
    updateWishlistUI();
});