// public/js/productList.js
document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById('productList');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');
    const messageContainer = document.getElementById('message-container');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    let currentPage = 1;
    let pendingDelete = { productId: null, page: null };
  
    // Fetch products function
    async function fetchProducts(page) {
      try {
        const response = await fetch(`/admin/product/product-list?page=${page}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
  
        const result = await response.json();
  
        if (response.ok) {
          updateProductTable(result.products);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          console.error("❌ Fetch Products Error:", result.error);
          showMessage("Error fetching products.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Fetch Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    }
  
    // Update product table
    function updateProductTable(products) {
      productList.innerHTML = "";
      if (!products || products.length === 0) {
        productList.innerHTML = '<tr><td colspan="7" class="text-center text-[var(--color-red-500)] font-semibold py-4">No products found.</td></tr>';
        noResults.classList.remove('hidden');
      } else {
        products.forEach(product => {
          const isLowStock = product.quantity <= 5;
          const stockMessage = isLowStock ? '<span class="stock-message">Out of Stock</span>' : '';
          const row = `
            <tr class="border-t border-[var(--color-gray-200)] product-row" data-product-id="${product._id}">
              <td class="px-4 py-2"><img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded"></td>
              <td class="px-4 py-2 product-name">${product.name}</td>
              <td class="px-4 py-2 category-name">${product.category}</td>
              <td class="px-4 py-2 brand-name">${product.brand}</td>
              <td class="px-4 py-2 stock-cell">${product.quantity}${stockMessage}</td>
              <td class="px-4 py-2">Rs ${product.price}</td>
              <td class="px-4 py-2 flex items-center gap-3">
                <a href="/admin/product/edit/${product._id}" class="text-[var(--color-black-500)] hover:text-[var(--color-red-700)] transition-colors duration-300">
                  <i class="bi bi-pencil-square"></i>
                </a>
                <button class="delete-btn text-[var(--color-red-500)] hover:text-[var(--color-red-700)] transition-colors duration-300" data-product-id="${product._id}" data-page="${currentPage}">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>`;
          productList.insertAdjacentHTML("beforeend", row);
  
          // Apply transition and blink effect after DOM insertion
          if (isLowStock) {
            const stockMessageElement = productList.querySelector(`[data-product-id="${product._id}"] .stock-message`);
            setTimeout(() => stockMessageElement.classList.add('visible'), 10); // Slight delay for transition
          }
        });
        noResults.classList.add('hidden');
      }
  
      // Add Delete Event Listeners
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
          const productId = this.getAttribute('data-product-id');
          const page = this.getAttribute('data-page');
          pendingDelete = { productId, page };
          showDeleteModal();
        });
      });
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
        if (currentPage > 1) fetchProducts(currentPage - 1);
      });
      pagination.appendChild(prevButton);
  
      for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `pagination-link flex items-center justify-center px-3 h-8 leading-tight border border-[var(--color-gray-300)] transition-all duration-300 ${i === currentPage ? 'text-[var(--color-red-500)] bg-[var(--color-red-50)] hover:bg-[var(--color-red-100)] hover:text-[var(--color-red-700)]' : 'text-[var(--color-gray-500)] bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)]'}`;
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
          e.preventDefault();
          fetchProducts(i);
        });
        pagination.appendChild(pageLink);
      }
  
      const nextButton = document.createElement('a');
      nextButton.href = '#';
      nextButton.className = 'pagination-btn flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-r-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      nextButton.innerHTML = '<span class="sr-only">Next</span><i class="bi bi-arrow-bar-right"></i>';
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) fetchProducts(currentPage + 1);
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
      pendingDelete = { productId: null, page: null };
    }
  
    // Handle Delete Confirmation
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        const { productId, page } = pendingDelete;
        if (!productId) return;
  
        const response = await fetch("/admin/product/delete-product", {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, page }),
        });
        const result = await response.json();
  
        if (response.ok) {
          showMessage('Product deleted successfully!', 'success');
          fetchProducts(page);
        } else {
          showMessage(result.message || 'Error deleting product', 'error');
        }
        hideDeleteModal();
      } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Network error. Please try again.', 'error');
        hideDeleteModal();
      }
    });
  
    // Handle Cancel
    cancelDeleteBtn.addEventListener('click', () => {
      hideDeleteModal();
    });
  
    // Initial Fetch
    fetchProducts(currentPage);
  });