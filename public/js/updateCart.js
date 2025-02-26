// public/js/updateCart.js
import { removeFromCart, updateCartQuantity } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", function () {
  try {
    // Cart Icon and Quantity Elements
    const cart_Icon = document.getElementById('js-cart');
    const cart_Qunatity = cart_Icon ? cart_Icon.querySelector('#js-cart-qunatiy') : null;

    if (!cart_Icon || !cart_Qunatity) {
      console.warn("Cart icon or quantity element not found, skipping cart functionality.");
      return; // Exit if critical elements are missing
    }

    // Cart Elements
    const cartItems = document.querySelectorAll('.cart-item');
    const updateCartButton = document.getElementById('updateCart');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const removeButtons = document.querySelectorAll('.remove-item');

    if (cartItems.length === 0 && !updateCartButton && !cartSubtotal && !cartTotal && removeButtons.length === 0) {
      console.warn("No cart elements found, skipping cart setup.");
      return;
    }

    // Calculate and update subtotal for an item
    function updateItemSubtotal(item) {
      try {
        const price = parseFloat(item.querySelector('.price').dataset.price);
        const quantity = parseInt(item.querySelector('.quantity').value) || 1; // Default to 1 if invalid
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
        let total = 0;
        cartItems.forEach(item => {
          total += updateItemSubtotal(item);
        });
        if (cartSubtotal) cartSubtotal.textContent = `Rs ${total.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `Rs ${total.toFixed(2)}`; // Add shipping or other fees here if applicable
      } catch (error) {
        console.error("Error updating cart total:", error);
      }
    }

    // Handle quantity input change (live update)
    cartItems.forEach(item => {
      const quantityInput = item.querySelector('.quantity');
      if (quantityInput) {
        quantityInput.addEventListener('input', function (e) {
          try {
            const quantity = parseInt(this.value) || 1; // Ensure minimum quantity of 1
            if (quantity < 1) this.value = 1; // Enforce minimum quantity
            updateCartTotal();
          } catch (error) {
            console.error("Error handling quantity input change:", error);
          }
        });
      }
    });

    // Handle Update Cart button click
    if (updateCartButton) {
      updateCartButton.addEventListener('click', async function () {
        try {
          const cartData = Array.from(cartItems).map(item => ({
            itemId: item.dataset.itemId,
            quantity: parseInt(item.querySelector('.quantity').value) || 1
          }));

          if (!cartData || cartData.length === 0) {
            console.warn("No cart items to update.");
            alert("No items to update in the cart.");
            return;
          }

          console.log("Sending cart data to server:", JSON.stringify({ updatedItems: cartData }, null, 2)); // Debug log

          const response = await fetch('/user/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updatedItems: cartData }) // Ensure updatedItems is sent
          });

          const result = await response.json();
          if (response.ok) {
            alert('Cart updated successfully!');
            
            // Update localStorage with server data
            localStorage.setItem('cart', JSON.stringify(result.cart.items.map(item => ({
              productId: item._id,
              quantity: item.quantity,
              price: item.price
            }))));

            // Update UI with server data
            result.cart.items.forEach(updatedItem => {
              const itemRow = document.querySelector(`.cart-item[data-item-id='${updatedItem._id}']`);
              if (itemRow) {
                const quantityInput = itemRow.querySelector('.quantity');
                const subtotal = itemRow.querySelector('.subtotal');
                quantityInput.value = updatedItem.quantity;
                subtotal.textContent = `Rs ${(updatedItem.price * updatedItem.quantity).toFixed(2)}`;
              }
            });

            // Update cart total
            updateCartTotal();

            // Update cart quantity in header
            updateCartQuantity();
          } else {
            alert(result.message || 'Error updating cart.');
          }
        } catch (error) {
          console.error('Error updating cart:', error);
          alert('Network error. Please try again.');
        }
      });
    }

    // Handle Remove Item button click
    removeButtons.forEach(button => {
      button.addEventListener('click', async function (e) {
        try {
          const itemId = this.dataset.itemId;
          const cartItem = this.closest('.cart-item');

          const response = await fetch(`/user/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          const result = await response.json();
          if (result.success) {
            // Remove from localStorage
            removeFromCart(itemId);

            // Remove from DOM
            if (cartItem) {
              cartItem.remove();
            }

            // Update cart total
            updateCartTotal();

            // If cart is empty, update UI
            if (document.querySelectorAll('.cart-item').length === 0) {
              const cartSection = document.querySelector('.md\\:col-span-2.space-y-6');
              const cartTotalSection = document.querySelector('.cart-total-section');
              if (cartSection) {
                cartSection.innerHTML = `<p class="text-[var(--color-gray-600)] text-lg text-center">Your cart is empty.</p>`;
              }
              if (cartTotalSection) {
                cartTotalSection.remove();
              }
            }

            // Update cart quantity in header
            updateCartQuantity();
          } else {
            alert(result.message || 'Error removing item.');
          }
        } catch (error) {
          console.error('Error removing item:', error);
          alert('Network error. Please try again.');
        }
      });
    });

    // Initial cart total calculation
    updateCartTotal();

    // Re-sync cart quantity when returning to the page
    window.addEventListener("focus", () => {
      try {
        updateCartQuantity();
      } catch (error) {
        console.error("Error updating cart quantity on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing cart update functionality:", error);
  }
});