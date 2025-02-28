// public/js/localStorage.js

// Function to get wishlist from localStorage
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch (error) {
    console.error("Error getting wishlist from localStorage:", error);
    return [];
  }
}

// Function to set wishlist in localStorage
function setWishlist(wishlist) {
  try {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  } catch (error) {
    console.error("Error setting wishlist in localStorage:", error);
  }
}

// Function to add a product to the wishlist
function addToWishlist(productId) {
  let wishlist = getWishlist();
  const productIndex = wishlist.findIndex(item => item.productId === String(productId));

  if (productIndex === -1) {
    // Add new item with isInWishlist set to true
    wishlist.push({ productId: String(productId), isInWishlist: true });
    setWishlist(wishlist);
  } else if (!wishlist[productIndex].isInWishlist) {
    // Update existing item to isInWishlist: true if it’s not already
    wishlist[productIndex].isInWishlist = true;
    setWishlist(wishlist);
  }
}

// Function to remove a product from the wishlist
function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(item => item.productId !== String(productId));
  setWishlist(wishlist);
}

// Function to update wishlist UI quantity on both screens with error handling
function updateWishlistQuantity() {
  const wishlist = getWishlist();
  const wishlistIcon = document.querySelector("#js-wishlist");

  if (wishlistIcon) {
    const wishlistQuantity = wishlistIcon.querySelector("#js-wishlist-quantity"); // Fixed typo
    if (wishlistQuantity) {
      const count = wishlist.filter(item => item.isInWishlist).length; // Count only active wishlist items
      wishlistQuantity.textContent = count > 0 ? count : '';
    } else {
      console.warn("Wishlist quantity element (#js-wishlist-quantity) not found.");
    }
  } else {
    console.warn("Wishlist icon (#js-wishlist) not found.");
  }
}

// Export functions to be used in other scripts
export { getWishlist, setWishlist, addToWishlist, removeFromWishlist, updateWishlistQuantity };