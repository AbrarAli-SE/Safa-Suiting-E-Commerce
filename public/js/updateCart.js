import { removeFromCart, updateCartQuantity } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const cartIcon = document.getElementById('js-cart');
    const cartQuantity = cartIcon?.querySelector('#js-cart-quantity');
    if (!cartIcon || !cartQuantity) {
      console.warn("Cart icon or quantity element not found.");
      return;
    }

    let cartItems = document.querySelectorAll('.cart-item');
    const updateCartButton = document.getElementById('updateCart');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');

    if (cartItems.length === 0 && !updateCartButton && !cartSubtotal && !cartTotal) {
      console.warn("No cart elements found.");
      return;
    }

    // Fetch shipping settings
    let shippingSettings = { shippingOption: 'free', shippingRate: 0, taxRate: 0 };
    try {
      const response = await fetch('/admin/shipping-settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (response.ok) {
        shippingSettings = await response.json();
      }
    } catch (error) {
      console.error("Error fetching shipping settings:", error);
    }

    // Calculate item subtotal (price * quantity)
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

    // Calculate and update cart totals
    function updateCartTotal() {
      try {
        cartItems = document.querySelectorAll('.cart-item');
        let subtotal = 0;
        cartItems.forEach(item => {
          subtotal += updateItemSubtotal(item);
        });

        const tax = subtotal * (shippingSettings.taxRate / 100);
        const shipping = shippingSettings.shippingOption === 'rate' ? shippingSettings.shippingRate : 0;
        const total = subtotal + tax + shipping;

        if (cartSubtotal) cartSubtotal.textContent = `Rs ${subtotal.toFixed(2)}`;
        if (cartShipping) cartShipping.textContent = shippingSettings.shippingOption === 'free' ? 'Free' : `Rs ${shipping.toFixed(2)}`;
        if (cartTax) cartTax.textContent = `Rs ${tax.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `Rs ${total.toFixed(2)}`;
      } catch (error) {
        console.error("Error updating cart total:", error);
      }
    }

    // Handle quantity changes
    function updateQuantity(itemId, change) {
      try {
        const quantityElement = document.querySelector(`.quantity-value[data-item-id="${itemId}"]`);
        if (!quantityElement) return;
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
      cartItems.forEach(item => {
        const decreaseButton = item.querySelector('.quantity-decrease');
        const increaseButton = item.querySelector('.quantity-increase');

        if (decreaseButton) {
          decreaseButton.addEventListener('click', () => {
            updateQuantity(decreaseButton.dataset.itemId, -1);
          });
        }

        if (increaseButton) {
          increaseButton.addEventListener('click', () => {
            updateQuantity(increaseButton.dataset.itemId, 1);
          });
        }
      });
    }

    // Handle Update Cart button
    if (updateCartButton) {
      updateCartButton.addEventListener('click', async () => {
        try {
          cartItems = document.querySelectorAll('.cart-item');
          const cartData = Array.from(cartItems).map(item => ({
            itemId: item.dataset.itemId,
            quantity: parseInt(item.querySelector('.quantity-value').textContent) || 1
          }));

          if (!cartData.length) {
            alert("No items to update in the cart.");
            return;
          }

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
                itemRow.querySelector('.quantity-value').textContent = updatedItem.quantity;
                itemRow.querySelector('.subtotal').textContent = `Rs ${(updatedItem.price * updatedItem.quantity).toFixed(2)}`;
              }
            });
            updateCartTotal();
            await updateCartQuantity();
          } else {
            alert(result.message || 'Error updating cart.');
          }
        } catch (error) {
          console.error('Error updating cart:', error);
          alert('Network error. Please try again.');
        }
      });
    }

    // Handle Remove Item
    document.addEventListener('click', async (e) => {
      const removeButton = e.target.closest('.remove-item');
      if (removeButton) {
        try {
          const itemId = removeButton.dataset.itemId;
          const cartItem = removeButton.closest('.cart-item');
          const response = await fetch(`/user/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          const result = await response.json();
          if (result.success) {
            await removeFromCart(itemId);
            if (cartItem) cartItem.remove();
            cartItems = document.querySelectorAll('.cart-item');
            const updatedCart = Array.from(cartItems).map(item => ({
              productId: item.dataset.itemId,
              quantity: parseInt(item.querySelector('.quantity-value').textContent) || 1,
              price: parseFloat(item.querySelector('.price').dataset.price) || 0
            }));
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            updateCartTotal();

            if (cartItems.length === 0) {
              document.querySelector('.md\\:col-span-2.space-y-6').innerHTML = `<p class="text-[var(--color-gray-600)] text-lg text-center">Your cart is empty.</p>`;
              document.querySelector('.cart-total-section')?.remove();
            }

            await updateCartQuantity();
          } else {
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

    window.addEventListener("focus", async () => {
      try {
        await updateCartQuantity();
      } catch (error) {
        console.error("Error updating cart quantity on focus:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing cart:", error);
  }
});