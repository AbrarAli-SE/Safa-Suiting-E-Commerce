import { getWishlist, removeFromWishlist, updateWishlistQuantity } from './localStorage.js';

document.addEventListener("DOMContentLoaded", function () {
    const removeButtons = document.querySelectorAll('.remove-from-wishlist');
    
    // Initial sync with localStorage
    let wishlist = getWishlist();
    updateWishlistQuantity();

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
            } else {
                alert(result.message || "Error removing item.");
            }
        });
    });
});
