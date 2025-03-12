import { removeFromCart, updateCartQuantity, clearCart } from './localStorage-cart.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const cartIcon = document.getElementById('js-cart');
    const cartQuantity = cartIcon?.querySelector('#js-cart-quantity');
    if (!cartIcon || !cartQuantity) return console.warn("Cart icon or quantity element not found.");

    const cartItems = document.querySelectorAll('.cart-item');
    const updateCartButton = document.getElementById('updateCart');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');

    if (window.location.pathname === '/user/cart/order-confirmation') {
      clearCart();
      return;
    }

    if (!cartItems.length && !updateCartButton && !cartSubtotal) return console.warn("No cart elements found.");

    function updateItemSubtotal(item) {
      const price = parseFloat(item.querySelector('.price').dataset.price) || 0;
      const quantity = parseInt(item.querySelector('.quantity-value').value) || 1;
      const subtotal = price * quantity;
      item.querySelector('.subtotal').textContent = `Rs ${subtotal.toFixed(2)}`;
      return subtotal;
    }

    function updateCartDisplay(data) {
      let subtotal = 0;
      cartItems.forEach(item => (subtotal += updateItemSubtotal(item)));
      cartSubtotal.textContent = `Rs ${subtotal.toFixed(2)}`;
      cartShipping.textContent = `Rs ${data.shipping.toFixed(2)}`;
      cartTax.textContent = `Rs ${data.tax.toFixed(2)}`;
      cartTotal.textContent = `Rs ${data.totalAmount.toFixed(2)}`;
    }

    function highlightOutOfStockItems(serverItems) {
      cartItems.forEach(item => {
        const itemId = item.dataset.itemId;
        const quantityInput = item.querySelector('.quantity-value');
        const requestedQuantity = parseInt(quantityInput.value) || 1;
        const serverItem = serverItems.find(i => i._id === itemId);
        const availableQuantity = serverItem?.availableQuantity || 0;

        // Remove previous highlights
        item.classList.remove('highlight-blink');

        if (requestedQuantity > availableQuantity) {
          // Add highlight with blink animation
          item.classList.add('highlight-blink');
          // Remove highlight after 5 seconds
          setTimeout(() => {
            item.classList.remove('highlight-blink');
          }, 5000); // 5 seconds
        }
      });
    }

    function setupQuantityListeners() {
      cartItems.forEach(item => {
        const decreaseBtn = item.querySelector('.quantity-decrease');
        const increaseBtn = item.querySelector('.quantity-increase');
        const quantityInput = item.querySelector('.quantity-value');

        decreaseBtn?.addEventListener('click', () => {
          let quantity = parseInt(quantityInput.value) || 1;
          quantityInput.value = Math.max(1, quantity - 1);
          updateItemSubtotal(item);
        });

        increaseBtn?.addEventListener('click', () => {
          let quantity = parseInt(quantityInput.value) || 1;
          quantityInput.value = quantity + 1;
          updateItemSubtotal(item);
        });

        quantityInput?.addEventListener('change', () => {
          quantityInput.value = Math.max(1, parseInt(quantityInput.value) || 1);
          updateItemSubtotal(item);
        });
      });
    }

    if (updateCartButton) {
      updateCartButton.addEventListener('click', async () => {
        const cartData = Array.from(cartItems).map(item => ({
          itemId: item.dataset.itemId,
          quantity: parseInt(item.querySelector('.quantity-value').value) || 1
        }));

        if (!cartData.length) return alert("No items to update in the cart.");

        const response = await fetch('/user/cart/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updatedItems: cartData }),
          credentials: 'include'
        });

        const result = await response.json();

        // Always highlight out-of-stock items
        highlightOutOfStockItems(result.cart.items);

        if (response.ok) {
          const hasStockIssues = cartData.some(item => {
            const serverItem = result.cart.items.find(i => i._id === item.itemId);
            return item.quantity > (serverItem?.availableQuantity || 0);
          });

          if (hasStockIssues) {
            alert('Some items exceed available stock. Please adjust quantities.');
            return;
          }

          alert('Cart updated successfully!');
          localStorage.setItem('cart', JSON.stringify(result.cart.items.map(item => ({
            productId: item.product,
            quantity: item.quantity,
            price: item.price
          }))));
          updateCartDisplay(result);
          await updateCartQuantity();
        } else {
          alert(result.message || 'Error updating cart.');
          if (result.message === 'Some items exceed available stock') {
            console.log('Stock issues:', result.stockIssues);
          }
        }
      });
    }

    document.addEventListener('click', async (e) => {
      const removeButton = e.target.closest('.remove-item');
      if (removeButton) {
        const itemId = removeButton.dataset.itemId;
        const cartItem = removeButton.closest('.cart-item');
        const response = await fetch(`/user/cart/remove/${itemId}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
          await removeFromCart(itemId);
          cartItem?.remove();
          const updatedCart = Array.from(document.querySelectorAll('.cart-item')).map(item => ({
            productId: item.dataset.itemId,
            quantity: parseInt(item.querySelector('.quantity-value').value) || 1,
            price: parseFloat(item.querySelector('.price').dataset.price) || 0
          }));
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          updateCartDisplay(result);
          if (!document.querySelectorAll('.cart-item').length) {
            document.querySelector('.md\\:col-span-2.space-y-6').innerHTML = `<p class="text-[var(--color-gray-600)] text-lg text-center">Your cart is empty.</p>`;
            document.querySelector('.cart-total-section')?.remove();
          }
          await updateCartQuantity();
        } else {
          alert(result.message || 'Error removing item.');
        }
      }
    });

    setupQuantityListeners();
    await updateCartQuantity();
  } catch (error) {
    console.error("Error initializing cart:", error);
  }
});