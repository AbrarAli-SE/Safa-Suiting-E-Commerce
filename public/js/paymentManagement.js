// public/js/paymentManagement.js
document.addEventListener("DOMContentLoaded", function () {
  const paymentsList = document.getElementById("paymentsList");
  const noResults = document.getElementById("noResults");
  const pagination = document.getElementById("pagination");
  const messageContainer = document.getElementById("message-container");
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  let currentPage = 1;
  let pendingDelete = { paymentId: null };

  // Fetch initial payments
  fetchPayments(currentPage);

  // Event listeners for update and delete buttons
  paymentsList.addEventListener("click", async function (e) {
    const updateButton = e.target.closest(".update-status-btn");
    const deleteButton = e.target.closest(".delete-payment-btn");

    if (updateButton) {
      const paymentId = updateButton.dataset.paymentId;
      const select = paymentsList.querySelector(`select[data-payment-id="${paymentId}"]`);
      const received = select.value === "Received";

      try {
        const response = await fetch("/admin/payments/toggle-received", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, received, page: currentPage }),
        });

        const result = await response.json();
        messageContainer.innerHTML = "";

        if (response.ok) {
          showMessage(result.message, "success");
          updatePaymentsTable(result.payments);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          showMessage(result.error || "An error occurred.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Update Status Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    }

    if (deleteButton) {
      const paymentId = deleteButton.dataset.paymentId;
      pendingDelete = { paymentId };
      showDeleteModal();
    }
  });

  // Handle Delete Confirmation
  confirmDeleteBtn.addEventListener('click', async () => {
    try {
      const { paymentId } = pendingDelete;
      if (!paymentId) return;

      const response = await fetch("/admin/payments/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, page: currentPage }),
      });

      const result = await response.json();
      messageContainer.innerHTML = "";

      if (response.ok) {
        showMessage(result.message, "success");
        updatePaymentsTable(result.payments);
        updatePagination(result.currentPage, result.totalPages);
        currentPage = result.currentPage;
      } else {
        showMessage(result.error || "An error occurred.", "error");
      }
      hideDeleteModal();
    } catch (error) {
      console.error("❌ AJAX Delete Error:", error);
      showMessage("Network error. Please try again.", "error");
      hideDeleteModal();
    }
  });

  // Handle Cancel
  cancelDeleteBtn.addEventListener('click', () => {
    hideDeleteModal();
  });

  // AJAX Pagination
  pagination.addEventListener("click", async function (e) {
    const target = e.target.closest(".page-link");
    if (!target) return;

    e.preventDefault();
    const page = parseInt(target.dataset.page);
    fetchPayments(page);
  });

  // Fetch payments function
  async function fetchPayments(page) {
    try {
      const response = await fetch(`/admin/payments?page=${page}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      const result = await response.json();

      if (response.ok) {
        updatePaymentsTable(result.payments);
        updatePagination(result.currentPage, result.totalPages);
        currentPage = result.currentPage;
        if (result.redirect) {
          fetchPayments(result.currentPage); // Redirect to last valid page if needed
        }
      } else {
        console.error("❌ Fetch Payments Error:", result.error);
        showMessage("Error fetching payments.", "error");
      }
    } catch (error) {
      console.error("❌ AJAX Fetch Error:", error);
      showMessage("Network error. Please try again.", "error");
    }
  }

  // Update payments table
  function updatePaymentsTable(payments) {
    paymentsList.innerHTML = "";
    if (!payments || payments.length === 0) {
      paymentsList.innerHTML = '<tr><td colspan="6" class="text-center text-[var(--color-red-500)] font-semibold py-4">No payments found.</td></tr>';
      noResults.classList.remove("hidden");
    } else {
      payments.forEach((payment, index) => {
        const row = `
          <tr class="border-t border-[var(--color-gray-200)]" data-payment-id="${payment._id}">
            <td class="px-4 py-2">${(currentPage - 1) * 10 + index + 1}</td>
            <td class="px-4 py-2">${payment.orderId}</td>
            <td class="px-4 py-2">${payment.customerName}</td>
            <td class="px-4 py-2">Rs. ${payment.amount.toFixed(2)}</td>
            <td class="px-4 py-2 flex items-center gap-2">
              <select class="status-dropdown w-24 p-1 border rounded text-[var(--color-gray-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue-500)]" data-payment-id="${payment._id}">
                <option value="Received" ${payment.received ? 'selected' : ''}>Received</option>
                <option value="Pending" ${!payment.received ? 'selected' : ''}>Pending</option>
              </select>
              <button class="update-status-btn text-[var(--color-blue-500)] hover:text-[var(--color-blue-700)] transition-colors duration-300" data-payment-id="${payment._id}" title="Update Status">
                <i class="bi bi-arrow-repeat"></i>
              </button>
            </td>
            <td class="px-4 py-2">
              <button class="delete-payment-btn text-[var(--color-red-500)] hover:text-[var(--color-red-700)] transition-colors duration-300" data-payment-id="${payment._id}" title="Delete Payment">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>`;
        paymentsList.insertAdjacentHTML("beforeend", row);
      });
      noResults.classList.add("hidden");
    }
  }

  // Update pagination (unchanged)
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
    prevButton.className = 'page-link flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-l-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
    prevButton.innerHTML = '<span class="sr-only">Previous</span><i class="bi bi-arrow-bar-left"></i>';
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage > 1) fetchPayments(currentPage - 1);
    });
    pagination.appendChild(prevButton);

    for (let i = startPage; i <= endPage; i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.className = `page-link flex items-center justify-center px-3 h-8 leading-tight border border-[var(--color-gray-300)] transition-all duration-300 ${i === currentPage ? 'text-[var(--color-red-500)] bg-[var(--color-red-50)] hover:bg-[var(--color-red-100)] hover:text-[var(--color-red-700)]' : 'text-[var(--color-gray-500)] bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)]'}`;
      pageLink.textContent = i;
      pageLink.dataset.page = i;
      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetchPayments(i);
      });
      pagination.appendChild(pageLink);
    }

    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.className = 'page-link flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-r-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
    nextButton.innerHTML = '<span class="sr-only">Next</span><i class="bi bi-arrow-bar-right"></i>';
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage < totalPages) fetchPayments(currentPage + 1);
    });
    pagination.appendChild(nextButton);
  }

  // Show message helper (unchanged)
  function showMessage(text, type) {
    const div = document.createElement("div");
    div.className = `p-4 rounded-md text-center font-medium ${type === "success" ? "bg-[var(--color-green-100)] text-[var(--color-green-500)]" : "bg-[var(--color-red-100)] text-[var(--color-red-500)]"}`;
    div.textContent = text;
    messageContainer.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  // Show/Hide Delete Modal (unchanged)
  function showDeleteModal() {
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('visible');
  }

  function hideDeleteModal() {
    deleteModal.classList.remove('visible');
    deleteModal.classList.add('hidden');
    pendingDelete = { paymentId: null };
  }
});