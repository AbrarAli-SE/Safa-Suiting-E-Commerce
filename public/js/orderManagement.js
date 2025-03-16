// public/js/orderManagement.js
document.addEventListener("DOMContentLoaded", function () {
    const ordersList = document.getElementById("ordersList");
    const noResults = document.getElementById("noResults");
    const pagination = document.getElementById("pagination");
    const messageContainer = document.getElementById("message-container");
    const statusFilter = document.getElementById("statusFilter");
    const orderIdInput = document.getElementById("orderId");
    const trackingIdInput = document.getElementById("trackingId");
    const assignTrackingBtn = document.getElementById("assignTrackingBtn");
    const orderModal = document.getElementById("orderModal");
    const closeModal = document.getElementById("closeModal");
    const orderDetailsContent = document.getElementById("orderDetailsContent");
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    let currentPage = 1;
    let pendingDelete = { orderId: null };
  
    // Fetch initial orders
    fetchOrders(currentPage);
  
    // Filter functionality
    statusFilter.addEventListener("change", function () {
      fetchOrders(1); // Reset to page 1 on filter change
    });
  
    // Assign Tracking ID functionality
    assignTrackingBtn.addEventListener("click", async function () {
      const orderId = orderIdInput.value.trim();
      const trackingId = trackingIdInput.value.trim();
  
      if (!orderId || !trackingId) {
        showMessage("Please enter both Order ID and Tracking ID.", "error");
        return;
      }
  
      try {
        const response = await fetch("/admin/orders/assign-tracking", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, trackingId }),
        });
  
        const result = await response.json();
        messageContainer.innerHTML = "";
  
        if (response.ok) {
          showMessage(result.message, "success");
          orderIdInput.value = "";
          trackingIdInput.value = "";
          fetchOrders(currentPage); // Refresh the order list
        } else {
          showMessage(result.error || "An error occurred while assigning tracking ID.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Assign Tracking Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    });
  
    // AJAX Pagination
    pagination.addEventListener("click", async function (e) {
      const target = e.target.closest(".page-link");
      if (!target) return;
  
      e.preventDefault();
      const page = parseInt(target.dataset.page);
      fetchOrders(page);
    });
  
    // Fetch orders function
    async function fetchOrders(page) {
      const filter = statusFilter.value;
      try {
        const response = await fetch(`/admin/orders?page=${page}&filter=${filter}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
  
        const result = await response.json();
  
        if (response.ok) {
          updateOrdersTable(result.orders);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          console.error("❌ Fetch Orders Error:", result.error);
          showMessage("Error fetching orders.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Fetch Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    }
  
    // Update orders table
    function updateOrdersTable(orders) {
      ordersList.innerHTML = "";
      if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="6" class="text-center text-[var(--color-red-500)] font-semibold py-4">No orders found.</td></tr>';
        noResults.classList.remove("hidden");
      } else {
        orders.forEach(order => {
          const row = `
            <tr class="border-t border-[var(--color-gray-200)] hover:bg-[var(--color-gray-100)]" data-order-id="${order.orderId}" data-status="${order.status}">
              <td class="px-4 py-2">${order.orderId}</td>
              <td class="px-4 py-2">${order.customerName}</td>
              <td class="px-4 py-2">Rs. ${order.totalPrice.toFixed(2)}</td>
              <td class="px-4 py-2">${order.trackingId || 'None'}</td>
              <td class="px-4 py-2 capitalize ${order.status === 'Shipped' ? 'text-[var(--color-green-500)]' : 'text-[var(--color-yellow-500)]'}">${order.status}</td>
              <td class="px-4 py-2 flex gap-2">
                <button class="view-btn text-[var(--color-blue-500)] hover:text-[var(--color-blue-700)]" data-order-id="${order.orderId}" title="View Details">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="delete-btn text-[var(--color-red-500)] hover:text-[var(--color-red-700)]" data-order-id="${order.orderId}" title="Delete Order">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>`;
          ordersList.insertAdjacentHTML("beforeend", row);
        });
        noResults.classList.add("hidden");
  
        // Add event listeners for action buttons
        document.querySelectorAll(".view-btn").forEach(btn => {
          btn.addEventListener("click", async function() {
            const orderId = this.getAttribute("data-order-id");
            await fetchOrderDetails(orderId);
            orderModal.classList.remove("hidden");
          });
        });
  
        document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", function() {
            const orderId = this.getAttribute("data-order-id");
            pendingDelete = { orderId };
            showDeleteModal();
          });
        });
      }
    }
  
    // Fetch order details
    async function fetchOrderDetails(orderId) {
      try {
        const response = await fetch(`/admin/orders/${orderId}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        const order = await response.json();
        if (response.ok) {
          orderDetailsContent.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer Name:</strong> ${order.customerName}</p>
            <p><strong>Total Price:</strong> Rs. ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Billing Address:</strong> ${order.billingInfo.streetAddress}, ${order.billingInfo.townCity}</p>
            <p><strong>Phone:</strong> ${order.billingInfo.phoneNumber}</p>
            <p><strong>Email:</strong> ${order.billingInfo.emailAddress}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <div class="mt-4">
              <h3 class="text-lg font-semibold">Items:</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                ${order.items.map(item => `
                  <div class="flex flex-col items-center bg-[var(--color-gray-50)] p-4 rounded-lg shadow-sm">
                    <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded mb-2">
                    <div class="text-center">
                      <p><strong>${item.name}</strong></p>
                      <p>Quantity: ${item.quantity}</p>
                      <p>Price: Rs. ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          orderDetailsContent.innerHTML = `<p class="text-[var(--color-red-500)]">Error loading order details.</p>`;
        }
      } catch (error) {
        console.error("❌ Fetch Order Details Error:", error);
        orderDetailsContent.innerHTML = `<p class="text-[var(--color-red-500)]">Network error. Please try again.</p>`;
      }
    }
  
    // Delete order
    async function deleteOrder(orderId) {
      try {
        const response = await fetch(`/admin/orders/${orderId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
  
        if (response.ok) {
          showMessage("Order deleted successfully.", "success");
          fetchOrders(currentPage); // Refresh the list
        } else {
          showMessage(result.error || "Error deleting order.", "error");
        }
      } catch (error) {
        console.error("❌ Delete Order Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    }
  
    // Handle Delete Confirmation
    confirmDeleteBtn.addEventListener('click', async () => {
      const { orderId } = pendingDelete;
      if (!orderId) return;
      await deleteOrder(orderId);
      hideDeleteModal();
    });
  
    // Handle Cancel
    cancelDeleteBtn.addEventListener('click', () => {
      hideDeleteModal();
    });
  
    // Close modal
    closeModal.addEventListener("click", () => {
      orderModal.classList.add("hidden");
    });
  
    // Update pagination
    function updatePagination(currentPage, totalPages) {
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
  
      pagination.innerHTML = '';
  
      // Previous Button
      const prevButton = document.createElement('a');
      prevButton.href = '#';
      prevButton.className = 'page-link flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-l-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      prevButton.innerHTML = '<span class="sr-only">Previous</span><i class="bi bi-arrow-bar-left"></i>';
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) fetchOrders(currentPage - 1);
      });
      pagination.appendChild(prevButton);
  
      // Page Numbers
      for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `page-link flex items-center justify-center px-3 h-8 leading-tight border border-[var(--color-gray-300)] transition-all duration-300 ${i === currentPage ? 'text-[var(--color-red-500)] bg-[var(--color-red-50)] hover:bg-[var(--color-red-100)] hover:text-[var(--color-red-700)]' : 'text-[var(--color-gray-500)] bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)]'}`;
        pageLink.textContent = i;
        pageLink.dataset.page = i; // Add dataset for pagination click handler
        pageLink.addEventListener('click', (e) => {
          e.preventDefault();
          fetchOrders(i);
        });
        pagination.appendChild(pageLink);
      }
  
      // Next Button
      const nextButton = document.createElement('a');
      nextButton.href = '#';
      nextButton.className = 'page-link flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-r-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      nextButton.innerHTML = '<span class="sr-only">Next</span><i class="bi bi-arrow-bar-right"></i>';
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) fetchOrders(currentPage + 1);
      });
      pagination.appendChild(nextButton);
    }
  
    // Show message helper
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
      pendingDelete = { orderId: null };
    }
  });