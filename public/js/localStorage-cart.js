function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (error) {
    console.error("Error getting cart from localStorage:", error);
    return [];
  }
}

function setCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error setting cart in localStorage:", error);
  }
}

function clearCart() {
  try {
    localStorage.removeItem("cart");
    console.log("Cart cleared from localStorage.");
    updateCartQuantity(); // Update UI to reflect empty cart
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error);
  }
}

async function addToCart(productId, quantity = 1, price = 0) {
  try {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.productId === productId);

    if (productIndex !== -1) {
      cart[productIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity, price });
    }

    setCart(cart);
    await updateCartQuantity();
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

async function removeFromCart(productId) {
  try {
    let cart = getCart();
    console.log("Before removal. Cart contents:", JSON.stringify(cart, null, 2));
    console.log("Removing productId:", productId);

    cart = cart.filter(item => {
      const match = item.productId !== productId;
      console.log(`Comparing ${item.productId} with ${String(productId)}: ${match}`);
      return match;
    });

    console.log("After removal. Cart contents:", JSON.stringify(cart, null, 2));
    setCart(cart);
    await updateCartQuantity();
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

async function updateCartQuantity() {
  try {
    const cart = getCart();
    console.log("Updating cart quantity. Cart contents:", JSON.stringify(cart, null, 2));
    const cartIcon = document.querySelector("#js-cart");

    if (cartIcon) {
      const cartQuantity = cartIcon.querySelector("#js-cart-quantity");
      if (cartQuantity) {
        const cartQuantityValue = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartQuantity.textContent = cartQuantityValue > 0 ? cartQuantityValue : '';
        console.log("Cart quantity updated to:", cartQuantityValue);
      } else {
        console.warn("Cart quantity element (#js-cart-quantity) not found.");
      }
    } else {
      console.warn("Cart icon (#js-cart) not found.");
    }
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    throw error;
  }
}

export { getCart, setCart, addToCart, removeFromCart, updateCartQuantity, clearCart };