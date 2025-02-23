
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
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        console.error('Error removing product from wishlist:', error);
        alert('An error occurred while removing the product.');
      }
    });
  });

  // Function to update wishlist quantity in the UI
  function updateWishlistQuantity(quantity) {
    const largeScreenWishlistIcon = document.querySelector("#largeScreenWishlist");
    const smallScreenWishlistIcon = document.querySelector("#smallScreenWishlist");

    const largeScreenWishlistQuantity = largeScreenWishlistIcon.querySelector("span");
    const smallScreenWishlistQuantity = smallScreenWishlistIcon.querySelector("span");

    largeScreenWishlistQuantity.textContent = quantity;
    smallScreenWishlistQuantity.textContent = quantity;
  }
