// public/js/updateCart.js
import { removeFromCart, updateCartQuantity } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Cart Icon and Quantity Elements
    const cartIcon = document.getElementById('js-cart');
    const cartQuantity = cartIcon ? cartIcon.querySelector('#js-cart-quantity') : null;

    if (!cartIcon || !cartQuantity) {
      console.warn("Cart icon or quantity element not found, skipping cart functionality.");
      return;
    }

    // Cart Elements
    let cartItems = document.querySelectorAll('.cart-item');
    const updateCartButton = document.getElementById('updateCart');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');

    if (cartItems.length === 0 && !updateCartButton && !cartSubtotal && !cartTotal) {
      console.warn("No cart elements found, skipping cart setup.");
      return;
    }

    // Calculate and update subtotal for an item
    function updateItemSubtotal(item) {
      try {
        const price = parseFloat(item.querySelector('.price').dataset.price);
        const quantityElement = item.querySelector('.quantity-value');
        const quantity = parseInt(quantityElement.textContent) || 1;
        const subtotalElement = item.querySelector('.subtotal');
        const subtotal = price * quantity;
        subtotalElement.textContent = `Rs ${subtotal.toFixed(2)}`;
        return subtotal;
      } catch (error) {
        console.error("Error updating item subtotal:", error);
        return 0;
      }
    }

    // Calculate and update total cart amount
    function updateCartTotal() {
      try {
        cartItems = document.querySelectorAll('.cart-item');
        let total = 0;
        cartItems.forEach(item => {
          total += updateItemSubtotal(item);
        });
        if (cartSubtotal) cartSubtotal.textContent = `Rs ${total.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `Rs ${total.toFixed(2)}`;
      } catch (error) {
        console.error("Error updating cart total:", error);
      }
    }

    // Handle quantity changes with plus and minus buttons
    function updateQuantity(itemId, change) {
      try {
        const quantityElement = document.querySelector(`.quantity-value[data-item-id="${itemId}"]`);
        if (!quantityElement) {
          console.warn(`Quantity element not found for itemId: ${itemId}`);
          return;
        }
        let quantity = parseInt(quantityElement.textContent) || 1;
        quantity = Math.max(1, quantity + change);
        quantityElement.textContent = quantity;
        updateCartTotal();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }

    // Setup quantity button listeners
    function setupQuantityListeners() {
      cartItems = document.querySelectorAll('.cart-item');
      cartItems.forEach(item => {
        const decreaseButton = item.querySelector('.quantity-decrease');
        const increaseButton = item.querySelector('.quantity-increase');

        if (decreaseButton) {
          decreaseButton.addEventListener('click', function () {
            try {
              const itemId = this.dataset.itemId;
              console.log(`Decrease clicked for itemId: ${itemId}`);
              updateQuantity(itemId, -1);
            } catch (error) {
              console.error("Error decreasing quantity:", error);
            }
          });
        }

        if (increaseButton) {
          increaseButton.addEventListener('click', function () {
            try {
              const itemId = this.dataset.itemId;
              console.log(`Increase clicked for itemId: ${itemId}`);
              updateQuantity(itemId, 1);
            } catch (error) {
              console.error("Error increasing quantity:", error);
            }
          });
        }
      });
    }

    // Handle Update Cart button click
    if (updateCartButton) {
      updateCartButton.addEventListener('click', async function () {
        try {
          cartItems = document.querySelectorAll('.cart-item');
          const cartData = Array.from(cartItems).map(item => {
            const itemId = item.dataset.itemId;
            const quantityElement = item.querySelector('.quantity-value');
            const quantity = parseInt(quantityElement.textContent) || 1;
            return { itemId, quantity };
          });

          if (!cartData || cartData.length === 0) {
            console.warn("No cart items to update.");
            alert("No items to update in the cart.");
            return;
          }

          console.log("Sending cart data to server:", JSON.stringify({ updatedItems: cartData }, null, 2));
          const response = await fetch('/user/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updatedItems: cartData })
          });

          const result = await response.json();
          if (response.ok) {
            alert('Cart updated successfully!');
            localStorage.setItem('cart', JSON.stringify(result.cart.items.map(item => ({
              productId: item._id,
              quantity: item.quantity,
              price: item.price
            }))));
            result.cart.items.forEach(updatedItem => {
              const itemRow = document.querySelector(`.cart-item[data-item-id='${updatedItem._id}']`);
              if (itemRow) {
                const quantityElement = itemRow.querySelector('.quantity-value');
                const subtotal = itemRow.querySelector('.subtotal');
                quantityElement.textContent = updatedItem.quantity;
                subtotal.textContent = `Rs ${(updatedItem.price * updatedItem.quantity).toFixed(2)}`;
              }
            });
            updateCartTotal();
            await updateCartQuantity();
          } else {
            console.error("Server error updating cart:", result.message);
            alert(result.message || 'Error updating cart.');
          }
        } catch (error) {
          console.error('Error updating cart:', error);
          alert('Network error. Please try again.');
        }
      });
    }

    // Handle Remove Item with event delegation
    document.addEventListener('click', async function (e) {
      const removeButton = e.target.closest('.remove-item');
      if (removeButton) {
        try {
          const itemId = removeButton.dataset.itemId;
          console.log(`Remove clicked for itemId: ${itemId}`);
          if (!itemId) {
            console.error("Item ID not found on remove button.");
            return;
          }

          const cartItem = removeButton.closest('.cart-item');
          const response = await fetch(`/user/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          const result = await response.json();
          if (result.success) {
            console.log(`Item ${itemId} removed successfully from server`);
            await removeFromCart(itemId);
            if (cartItem) {
              cartItem.remove();
              console.log(`Item ${itemId} removed from DOM`);
            }

            // Sync localStorage with remaining cart items
  cartItems = document.querySelectorAll('.cart-item');
  const updatedCart = Array.from(cartItems).map(item => ({
    productId: item.dataset.itemId,
    quantity: parseInt(item.querySelector('.quantity-value').textContent) || 1,
    price: parseFloat(item.querySelector('.price').dataset.price) || 0
  }));
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  console.log("Synced localStorage with DOM:", updatedCart);
            updateCartTotal();

            if (cartItems.length === 0) {
              const cartSection = document.querySelector('.md\\:col-span-2.space-y-6');
              const cartTotalSection = document.querySelector('.cart-total-section');
              if (cartSection) {
                cartSection.innerHTML = `<p class="text-[var(--color-gray-600)] text-lg text-center">Your cart is empty.</p>`;
              }
              if (cartTotalSection) {
                cartTotalSection.remove();
              }
            }

            await updateCartQuantity();
          } else {
            console.error("Server error removing item:", result.message);
            alert(result.message || 'Error removing item.');
          }
        } catch (error) {
          console.error('Error removing item:', error);
          alert('Network error. Please try again.');
        }
      }
    });

    // Initial setup
    updateCartTotal();
    setupQuantityListeners();
    await updateCartQuantity();

    // Re-sync cart quantity on focus
    window.addEventListener("focus", async () => {
      try {
        await updateCartQuantity();
      } catch (error) {
        console.error("Error updating cart quantity on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing cart update functionality:", error);
  }
});