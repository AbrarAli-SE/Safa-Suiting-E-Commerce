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

// Function to update cart quantity on both screens with enhanced debugging
function updateCartQuantity() {
  const cart = getCart();
  console.log("Updating cart quantity. Current cart:", cart); // Debug log
  const cartIcon = document.querySelector("#js-cart");

  if (cartIcon) {
    const cartQuantity = cartIcon.querySelector("#js-cart-qunatiy");
    if (cartQuantity) {
      const cartQuantityValue = cart.reduce((sum, item) => sum + (item.quantity || 0), 0); // Handle potential undefined quantity
      console.log("Cart quantity value:", cartQuantityValue); // Debug log
      cartQuantity.textContent = cartQuantityValue > 0 ? cartQuantityValue : ''; // Only show if > 0
    } else {
      console.warn("Cart quantity element (#js-cart-qunatiy) not found.");
    }
  } else {
    console.warn("Cart icon (#js-cart) not found.");
  }
}

// Export functions
export { getCart, setCart, addToCart, removeFromCart, updateCartQuantity };