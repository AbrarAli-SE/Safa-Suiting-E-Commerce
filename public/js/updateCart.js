// public/js/cart.js
import { removeFromCart, updateCartQuantity } from './localStorage-cart.js';

// Update Cart Functionality
document.getElementById('updateCart')?.addEventListener('click', async () => {
  const cartItems = document.querySelectorAll('.quantity');
  const updatedItems = [];

  cartItems.forEach(item => {
    const itemId = item.getAttribute('data-item-id');
    const quantity = parseInt(item.value, 10);
    if (quantity > 0) {
      updatedItems.push({ itemId, quantity });
    }
  });

  try {
    const response = await fetch('/user/cart/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updatedItems })
    });

    const data = await response.json();
    if (data.success) {
      // Update localStorage with server data
      localStorage.setItem('cart', JSON.stringify(data.cart.items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price
      }))));

      // Update UI
      data.cart.items.forEach(updatedItem => {
        const itemRow = document.querySelector(`.cart-item[data-item-id='${updatedItem._id}']`);
        if (itemRow) {
          const quantityInput = itemRow.querySelector('.quantity');
          const subtotal = itemRow.querySelector('.subtotal');
          quantityInput.value = updatedItem.quantity;
          subtotal.textContent = `$${(updatedItem.price * updatedItem.quantity).toFixed(2)}`;
        }
      });

      // Update cart total
      const cartTotalElement = document.getElementById('cartTotal');
      const cartSubtotalElement = document.getElementById('cartSubtotal');
      const totalPrice = data.cart.totalPrice || data.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (cartTotalElement) {
        cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
        cartSubtotalElement.textContent = `$${totalPrice.toFixed(2)}`;
      }

      // Update cart quantity in UI
      updateCartQuantity();
    } else {
      alert(data.message || 'An error occurred.');
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    alert('Failed to update cart.');
  }
});

// Remove Item Functionality
document.querySelectorAll('.remove-item').forEach(button => {
  button.addEventListener('click', async (e) => {
    const itemId = e.target.getAttribute('data-item-id');

    try {
      const response = await fetch(`/user/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove from localStorage
        removeFromCart(itemId);

        // Remove from DOM
        const itemRow = document.querySelector(`.cart-item[data-item-id='${itemId}']`);
        if (itemRow) {
          itemRow.remove();
        }

        // Update cart total
        const cartTotalElement = document.getElementById('cartTotal');
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        const totalPrice = data.cart.totalPrice || data.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (cartTotalElement) {
          cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
          cartSubtotalElement.textContent = `$${totalPrice.toFixed(2)}`;
        }

        // If cart is empty, update UI
        if (data.cart.items.length === 0) {
          const cartSection = document.querySelector('.md\\:col-span-2.space-y-6');
          const cartTotalSection = document.querySelector('.cart-total-section');
          cartSection.innerHTML = `<p>Your cart is empty.</p>`;
          if (cartTotalSection) {
            cartTotalSection.remove();
          }
        }

        // Update cart quantity in UI
        updateCartQuantity();
      } else {
        alert(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item.');
    }
  });
});

// Live Quantity Change: Update Subtotal and Total Price
document.querySelectorAll('.quantity').forEach(input => {
  input.addEventListener('input', (e) => {
    const quantityInput = e.target;
    const itemId = quantityInput.getAttribute('data-item-id');
    const quantity = parseInt(quantityInput.value, 10);
    const itemRow = document.querySelector(`.cart-item[data-item-id='${itemId}']`);
    const price = parseFloat(itemRow.querySelector('.price').getAttribute('data-price'));
    const subtotal = itemRow.querySelector('.subtotal');

    if (quantity > 0) {
      const itemSubtotal = (price * quantity).toFixed(2);
      subtotal.textContent = `$${itemSubtotal}`;
    }

    let totalPrice = 0;
    document.querySelectorAll('.subtotal').forEach(sub => {
      totalPrice += parseFloat(sub.textContent.replace('$', ''));
    });

    const cartTotalElement = document.getElementById('cartTotal');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    if (cartTotalElement) {
      cartTotalElement.textContent = `$${totalPrice.toFixed(2)}`;
      cartSubtotalElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
  });
});

// Initialize cart quantity on page load
updateCartQuantity();