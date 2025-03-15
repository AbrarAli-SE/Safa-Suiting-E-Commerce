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
        const errorMessageContainer = document.createElement('div'); // Add error message container
        errorMessageContainer.className = 'error-message text-[var(--color-red-500)] text-center mb-4 hidden';
        
        if (cartItems.length) {
            document.querySelector('.md\\:col-span-2.space-y-6').prepend(errorMessageContainer);
        }

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
            cartItems.forEach(item => {
                subtotal += updateItemSubtotal(item);
                const available = parseInt(item.dataset.availableQuantity) || Infinity;
                const currentQty = parseInt(item.querySelector('.quantity-value').value) || 1;
                
                // Highlight if quantity exceeds available stock
                if (currentQty > available) {
                    item.classList.add('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                } else {
                    item.classList.remove('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                }
            });
            cartSubtotal.textContent = `Rs ${subtotal.toFixed(2)}`;
            cartShipping.textContent = `Rs ${data.shipping.toFixed(2)}`;
            cartTax.textContent = `Rs ${data.tax.toFixed(2)}`;
            cartTotal.textContent = `Rs ${data.totalAmount.toFixed(2)}`;
        }

        function setupQuantityListeners() {
            cartItems.forEach(item => {
                const decreaseBtn = item.querySelector('.quantity-decrease');
                const increaseBtn = item.querySelector('.quantity-increase');
                const quantityInput = item.querySelector('.quantity-value');
                const availableQty = parseInt(item.dataset.availableQuantity) || Infinity;

                decreaseBtn?.addEventListener('click', () => {
                    let quantity = parseInt(quantityInput.value) || 1;
                    quantityInput.value = Math.max(1, quantity - 1);
                    updateItemSubtotal(item);
                    if (quantityInput.value <= availableQty) {
                        item.classList.remove('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                        errorMessageContainer.classList.add('hidden');
                    }
                });

                increaseBtn?.addEventListener('click', () => {
                    let quantity = parseInt(quantityInput.value) || 1;
                    quantityInput.value = quantity + 1;
                    updateItemSubtotal(item);
                    if (quantityInput.value > availableQty) {
                        item.classList.add('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                    }
                });

                quantityInput?.addEventListener('change', () => {
                    quantityInput.value = Math.max(1, parseInt(quantityInput.value) || 1);
                    updateItemSubtotal(item);
                    if (quantityInput.value > availableQty) {
                        item.classList.add('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                    } else {
                        item.classList.remove('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                    }
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
                    // Update available quantities in DOM
                    cartItems.forEach(item => {
                        const cartItem = result.cart.items.find(i => i._id === item.dataset.itemId);
                        if (cartItem) {
                            item.dataset.availableQuantity = cartItem.availableQuantity;
                        }
                    });
                    updateCartDisplay(result);
                    errorMessageContainer.classList.add('hidden');
                    await updateCartQuantity();
                } else {
                    errorMessageContainer.textContent = result.message || 'Error updating cart.';
                    errorMessageContainer.classList.remove('hidden');
                    // Highlight items with stock issues
                    cartItems.forEach(item => {
                        const stockIssue = result.stockIssues?.find(i => i.itemId === item.dataset.itemId);
                        if (stockIssue) {
                            item.classList.add('border-[var(--color-red-500)]', 'border-2', 'bg-[var(--color-red-50)]');
                            item.dataset.availableQuantity = stockIssue.available;
                        }
                    });
                    updateCartDisplay(result);
                }
            });
        }

        // Rest of the event listeners remain the same...
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