document.addEventListener("DOMContentLoaded", function () {
    const viewButtons = document.querySelectorAll(".view-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");
    const modal = document.getElementById("productModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const closeModal = document.getElementById("closeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
  
    // Dynamic order data from the server (assumed to be passed via EJS)
    const orders = [
      <% orders.forEach(order => { %>
        {
          id: "<%= order._id %>",
          name: "<%= order.product.name %>",
          category: "<%= order.product.category %>",
          quantity: <%= order.quantity || 1 %>,
          price: "Rs <%= order.price.toFixed(2) %>",
          description: "<%= order.product.description || 'No description available.' %>",
          image: "<%= order.product.image %>"
        },
      <% }) %>
    ];
  
    function openModal(productId) {
      const order = orders.find(o => o.id === productId);
      if (order) {
        modalTitle.textContent = order.name;
        modalContent.innerHTML = `
          <div class="flex gap-4">
            <img src="${order.image}" alt="${order.name}" class="w-32 h-32 object-cover rounded">
            <div>
              <p><strong>Category:</strong> ${order.category}</p>
              <p><strong>Quantity:</strong> ${order.quantity}</p>
              <p><strong>Price:</strong> ${order.price}</p>
              <p><strong>Description:</strong> ${order.description}</p>
            </div>
          </div>
        `;
  
        modal.classList.remove("opacity-0", "pointer-events-none");
        modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-95');
        modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-100');
        document.body.style.overflow = 'hidden';
      }
    }
  
    function closeModalFunction() {
      modal.classList.add("opacity-0", "pointer-events-none");
      modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-100');
      modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-95');
      document.body.style.overflow = 'auto';
    }
  
    closeModalBtn.addEventListener("click", closeModalFunction);
    closeModal.addEventListener("click", closeModalFunction);
  
    viewButtons.forEach(button => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const productId = this.getAttribute("data-product-id");
        openModal(productId);
      });
    });
  
    deleteButtons.forEach(button => {
      button.addEventListener("click", async function (e) {
        e.preventDefault();
        const productId = this.getAttribute("data-product-id");
        const row = this.closest('tr');
  
        if (confirm('Are you sure you want to delete this order?')) {
          try {
            const response = await fetch(`/user/order/delete/${productId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
  
            const result = await response.json();
            if (response.ok) {
              row.remove();
              if (document.querySelectorAll('tr[data-order-id]').length === 0) {
                document.getElementById('productList').innerHTML = `
                  <tr>
                    <td colspan="6" class="px-4 py-3 text-center text-[var(--color-gray-600)]">No orders found.</td>
                  </tr>
                `;
              }
            } else {
              alert(result.message || 'Error deleting order.');
            }
          } catch (error) {
            console.error('Error deleting order:', error);
            alert('Network error. Please try again.');
          }
        }
      });
    });
  });