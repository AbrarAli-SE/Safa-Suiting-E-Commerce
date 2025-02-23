// public/js/localStorage-cart.js

// Function to get the cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
  
  // Function to set the cart in localStorage
  function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  // Function to add a product to the cart
  function addToCart(productId, quantity = 1, price = 0) {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.productId === productId);
  
    if (productIndex !== -1) {
      cart[productIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity, price });
    }
    
    setCart(cart);
    updateCartQuantity();
  }
  
  // Function to remove a product from the cart
  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.productId !== productId);
    setCart(cart);
    updateCartQuantity();
  }
  
  // Function to update cart quantity on both screens
  function updateCartQuantity() {
    const cart = getCart();
    const largeScreenCartIcon = document.querySelector("#largeScreenCart");
    const smallScreenCartIcon = document.querySelector("#smallScreenCart");
  
    if (largeScreenCartIcon && smallScreenCartIcon) {
      const largeScreenCartQuantity = largeScreenCartIcon.querySelector("span");
      const smallScreenCartQuantity = smallScreenCartIcon.querySelector("span");
  
      const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
      largeScreenCartQuantity.textContent = cartQuantity;
      smallScreenCartQuantity.textContent = cartQuantity;
    }
  }
  
  // Export functions
  export { getCart, setCart, addToCart, removeFromCart, updateCartQuantity };