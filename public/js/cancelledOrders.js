// public/js/cancelledOrders.js
document.addEventListener("DOMContentLoaded", function () {
    const cancelledOrderList = document.getElementById('cancelledOrderList');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');
    const messageContainer = document.getElementById('message-container');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    let currentPage = 1;
    let pendingDelete = { orderId: null, page: null };
  
    // Fetch cancelled orders function
    async function fetchCancelledOrders(page) {
      try {
        const response = await fetch(`/admin/cancel-order?page=${page}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
  
        const result = await response.json();
  
        if (response.ok) {
          updateCancelledOrderTable(result.cancelledOrders);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          console.error("❌ Fetch Cancelled Orders Error:", result.error);
          showMessage("Error fetching cancelled orders.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Fetch Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    }
  
    // Update cancelled order table
    function updateCancelledOrderTable(cancelledOrders) {
      cancelledOrderList.innerHTML = "";
      if (!cancelledOrders || cancelledOrders.length === 0) {
        cancelledOrderList.innerHTML = '<tr><td colspan="5" class="text-center text-[var(--color-red-500)] font-semibold py-4">No cancelled orders found.</td></tr>';
        noResults.classList.remove('hidden');
      } else {
        cancelledOrders.forEach(order => {
          try {
            const row = `
              <tr class="border-t border-[var(--color-gray-200)] cancelled-order-row" data-order-id="${order.orderId || 'N/A'}">
                <td class="px-4 py-[1rem]">${order.orderId || 'N/A'}</td>
                <td class="px-4 py-2">${order.user?.email || 'Unknown'}</td>
                <td class="px-4 py-2">Rs ${order.totalAmount?.toFixed(2) || '0.00'}</td>
                <td class="px-4 py-2">${order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString() : 'N/A'}</td>
                <td class="px-4 py-2 flex items-center gap-3">
                  <button class="view-btn text-[var(--color-blue-500)] hover:text-[var(--color-blue-700)] transition-colors duration-300" data-order-id="${order.orderId || 'N/A'}">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="delete-btn text-[var(--color-red-500)] hover:text-[var(--color-red-700)] transition-colors duration-300" data-order-id="${order.orderId || 'N/A'}" data-page="${currentPage}">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr id="details-${order.orderId || 'N/A'}" class="hidden border-t border-[var(--color-gray-200)]">
                <td colspan="5" class="px-4 py-2 bg-[var(--color-gray-50)]">
                  <div class="space-y-2">
                    ${order.items?.length ? order.items.map(item => `
                      <div class="flex justify-between">
                        <span>${item.name || 'Unknown'} (x${item.quantity || 0})</span>
                        <span>Rs ${(item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : '0.00')}</span>
                      </div>
                    `).join('') : '<p>No items available</p>'}
                    <p class="text-[var(--color-red-500)] font-semibold">Cancellation Reason: ${order.cancellationReason || 'Not specified'}</p>
                    <p>Billing Address: ${order.billingInfo?.streetAddress || 'N/A'}, ${order.billingInfo?.townCity || 'N/A'}</p>
                    <p>Phone: ${order.billingInfo?.phoneNumber || 'N/A'}</p>
                    <p>Payment Method: ${order.paymentMethod || 'N/A'}</p>
                    <p>Originally Placed: ${order.originalCreatedAt ? new Date(order.originalCreatedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </td>
              </tr>`;
            cancelledOrderList.insertAdjacentHTML("beforeend", row);
          } catch (error) {
            console.error(`Error rendering order ${order.orderId}:`, error);
          }
        });
        noResults.classList.add('hidden');
  
        // Add View Event Listeners
        document.querySelectorAll('.view-btn').forEach(button => {
          button.addEventListener('click', function () {
            const orderId = this.getAttribute('data-order-id');
            const detailsRow = document.getElementById(`details-${orderId}`);
            detailsRow.classList.toggle('hidden');
          });
        });
  
        // Add Delete Event Listeners
        document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', function () {
            const orderId = this.getAttribute('data-order-id');
            const page = this.getAttribute('data-page');
            pendingDelete = { orderId, page };
            showDeleteModal();
          });
        });
      }
    }
  
    // Update pagination
    function updatePagination(currentPage, totalPages) {
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
  
      pagination.innerHTML = '';
  
      const prevButton = document.createElement('a');
      prevButton.href = '#';
      prevButton.className = 'pagination-btn flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-l-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      prevButton.innerHTML = '<span class="sr-only">Previous</span><i class="bi bi-arrow-bar-left"></i>';
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) fetchCancelledOrders(currentPage - 1);
      });
      pagination.appendChild(prevButton);
  
      for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `pagination-link flex items-center justify-center px-3 h-8 leading-tight border border-[var(--color-gray-300)] transition-all duration-300 ${i === currentPage ? 'text-[var(--color-red-500)] bg-[var(--color-red-50)] hover:bg-[var(--color-red-100)] hover:text-[var(--color-red-700)]' : 'text-[var(--color-gray-500)] bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)]'}`;
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
          e.preventDefault();
          fetchCancelledOrders(i);
        });
        pagination.appendChild(pageLink);
      }
  
      const nextButton = document.createElement('a');
      nextButton.href = '#';
      nextButton.className = 'pagination-btn flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-r-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      nextButton.innerHTML = '<span class="sr-only">Next</span><i class="bi bi-arrow-bar-right"></i>';
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) fetchCancelledOrders(currentPage + 1);
      });
      pagination.appendChild(nextButton);
    }
  
    // Show Message
    function showMessage(text, type) {
      const div = document.createElement("div");
      div.className = `p-4 rounded-md text-center font-medium ${type === "success" ? "bg-[var(--color-green-100)] text-[var(--color-green-500)]" : "bg-[var(--color-red-100)] text-[var(--color-red-500)]"}`;
      div.textContent = text;
      messageContainer.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }
  
    // Show Delete Modal
    function showDeleteModal() {
      deleteModal.classList.remove('hidden');
      deleteModal.classList.add('visible');
    }
  
    // Hide Delete Modal
    function hideDeleteModal() {
      deleteModal.classList.remove('visible');
      deleteModal.classList.add('hidden');
      pendingDelete = { orderId: null, page: null };
    }
  
    // Handle Delete Confirmation
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        const { orderId, page } = pendingDelete;
        if (!orderId) return;
  
        const response = await fetch(`/admin/cancel-order/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, page }),
        });
        const result = await response.json();
  
        if (response.ok) {
          showMessage(result.message || 'Cancelled order deleted successfully!', 'success');
          updateCancelledOrderTable(result.cancelledOrders);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          showMessage(result.error || 'Error deleting cancelled order', 'error');
        }
        hideDeleteModal();
      } catch (error) {
        console.error('Error deleting cancelled order:', error);
        showMessage('Network error. Please try again.', 'error');
        hideDeleteModal();
      }
    });
  
    // Handle Cancel
    cancelDeleteBtn.addEventListener('click', () => {
      hideDeleteModal();
    });
  
    // Initial Fetch
    fetchCancelledOrders(currentPage);
  });