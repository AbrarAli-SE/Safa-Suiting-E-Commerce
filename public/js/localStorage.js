// public/js/localStorage.js

// Function to get wishlist from localStorage
function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  }
  
  // Function to set wishlist in localStorage
  function setWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }
  
  // Function to add a product to the wishlist
  function addToWishlist(productId) {
    let wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      setWishlist(wishlist);
    }
  }
  
  // Function to remove a product from the wishlist
  function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    setWishlist(wishlist);
  }
  
  // Function to update wishlist UI quantity on both screens with error handling
  function updateWishlistQuantity() {
    const wishlist = getWishlist();
    const wishlistIcon = document.querySelector("#js-wishlist"); // Updated to match your HTML ID
  
    if (wishlistIcon) {
      const wishlistQuantity = wishlistIcon.querySelector("#js-wishlist-qunatiy"); // Updated to match your span ID
      if (wishlistQuantity) {
        wishlistQuantity.textContent = wishlist.length > 0 ? wishlist.length : ''; // Only show if > 0
      } else {
        console.warn("Wishlist quantity element (#js-wishlist-qunatiy) not found.");
      }
    } else {
      console.warn("Wishlist icon (#js-wishlist) not found.");
    }
  }
  
  // Export functions to be used in other scripts
  export { getWishlist, setWishlist, addToWishlist, removeFromWishlist, updateWishlistQuantity };