// localStorage.js

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

// Function to update wishlist UI quantity on both screens
function updateWishlistQuantity() {
    const wishlist = getWishlist();
    const largeScreenWishlistIcon = document.querySelector("#largeScreenWishlist");
    const largeScreenWishlistQuantity = largeScreenWishlistIcon.querySelector("span");
    const smallScreenWishlistIcon = document.querySelector("#smallScreenWishlist");
    const smallScreenWishlistQuantity = smallScreenWishlistIcon.querySelector("span");

    largeScreenWishlistQuantity.textContent = wishlist.length;
    smallScreenWishlistQuantity.textContent = wishlist.length;
}

// Export functions to be used in other scripts
export { getWishlist, setWishlist, addToWishlist, removeFromWishlist, updateWishlistQuantity };
