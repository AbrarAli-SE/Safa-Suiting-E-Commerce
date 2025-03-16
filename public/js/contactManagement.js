// public/js/contactManagement.js
document.addEventListener("DOMContentLoaded", function () {
    const contactList = document.getElementById('contactList');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');
    const messageContainer = document.getElementById('message-container');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const contactModal = document.getElementById("contactModal");
    const modalContent = document.getElementById("modalContent");
    const replyForm = document.getElementById('replyForm');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');
    let currentPage = 1;
    let pendingDelete = { contactId: null, page: null };
  
    // Close Modal Function
    function closeModal() {
      contactModal.classList.add("hidden");
      modalContent.classList.remove('scale-100');
      modalContent.classList.add('scale-95');
      document.body.style.overflow = 'auto';
      replyForm.reset();
    }
  
    // Attach event listener to close button
    closeModalBtn.addEventListener('click', closeModal);
  
    // Fetch contacts function
    async function fetchContacts(page) {
      try {
        const response = await fetch(`/admin/contacts?page=${page}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        updateContactTable(result.contacts);
        updatePagination(result.currentPage, result.totalPages);
        currentPage = result.currentPage;
      } catch (error) {
        console.error("❌ Fetch Contacts Error:", error);
        showMessage("Error fetching contacts: " + error.message, "error");
      }
    }
  
    // Update contact table
    function updateContactTable(contacts) {
      contactList.innerHTML = "";
      if (!contacts || contacts.length === 0) {
        contactList.innerHTML = '<tr><td colspan="7" class="text-center text-[var(--color-red-500)] font-semibold py-4">No contact submissions found.</td></tr>';
        noResults.classList.remove('hidden');
      } else {
        contacts.forEach(contact => {
          const row = `
            <tr class="border-t border-[var(--color-gray-200)] contact-row" data-contact-id="${contact._id}">
              <td class="px-4 py-2">${contact.name}</td>
              <td class="px-4 py-2">${contact.email}</td>
              <td class="px-4 py-2">${contact.phone || 'N/A'}</td>
              <td class="px-4 py-2">${contact.message.substring(0, 20)}...</td>
              <td class="px-4 py-2">${new Date(contact.createdAt).toLocaleString()}</td>
              <td class="px-4 py-2">
                <span class="capitalize ${contact.replyStatus === 'replied' ? 'text-[var(--color-green-500)]' : 'text-[var(--color-red-500)]'}">
                  ${contact.replyStatus || 'Pending'}
                </span>
              </td>
              <td class="px-4 py-2 flex items-center gap-3">
                <button class="view-btn text-[var(--color-black-500)] hover:text-[var(--color-red-700)] transition-colors duration-300"
                  data-contact-id="${contact._id}"
                  data-name="${contact.name}"
                  data-email="${contact.email}"
                  data-phone="${contact.phone || 'N/A'}"
                  data-message="${contact.message}"
                  data-date="${new Date(contact.createdAt).toLocaleString()}"
                  data-status="${contact.replyStatus || 'Pending'}"
                  data-reply-message="${contact.replyMessage || ''}"><i class="bi bi-eye"></i></button>
                <button class="delete-btn text-[var(--color-red-500)] hover:text-[var(--color-red-700)] transition-colors duration-300" data-contact-id="${contact._id}" data-page="${currentPage}"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`;
          contactList.insertAdjacentHTML("beforeend", row);
        });
        noResults.classList.add('hidden');
      }
  
      // View button listeners
      document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function () {
          document.getElementById("modalName").textContent = this.dataset.name;
          document.getElementById("modalEmail").textContent = this.dataset.email;
          document.getElementById("modalPhone").textContent = this.dataset.phone;
          document.getElementById("modalMessage").textContent = this.dataset.message;
          document.getElementById("modalDate").textContent = this.dataset.date;
          document.getElementById("modalStatus").textContent = this.dataset.status;
          document.getElementById("modalReplyMessage").textContent = this.dataset.replyMessage || 'No reply sent yet';
          document.getElementById("modalContactId").value = this.dataset.contactId;
          contactModal.classList.remove("hidden");
          modalContent.classList.remove('scale-95');
          modalContent.classList.add('scale-100');
          document.body.style.overflow = 'hidden';
        });
      });
  
      // Delete button listeners
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
          const contactId = this.getAttribute('data-contact-id');
          const page = this.getAttribute('data-page');
          pendingDelete = { contactId, page };
          showDeleteModal();
        });
      });
    }
  
    // Reply form submission
    replyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const contactId = document.getElementById('modalContactId').value;
      const replyMessage = document.getElementById('replyMessage').value;
      const email = document.getElementById('modalEmail').textContent;
  
      try {
        const response = await fetch('/admin/contacts/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactId, replyMessage, email })
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
  
        showMessage('Reply sent successfully!', 'success');
        closeModal();
        await fetchContacts(currentPage);
      } catch (error) {
        console.error('Error sending reply:', error);
        showMessage('Error sending reply: ' + error.message, 'error');
      }
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
  
      const prevButton = document.createElement('a');
      prevButton.href = '#';
      prevButton.className = 'pagination-btn flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-l-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      prevButton.innerHTML = '<span class="sr-only">Previous</span><i class="bi bi-arrow-bar-left"></i>';
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) fetchContacts(currentPage - 1);
      });
      pagination.appendChild(prevButton);
  
      for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `pagination-link flex items-center justify-center px-3 h-8 leading-tight border border-[var(--color-gray-300)] transition-all duration-300 ${i === currentPage ? 'text-[var(--color-red-500)] bg-[var(--color-red-50)] hover:bg-[var(--color-red-100)] hover:text-[var(--color-red-700)]' : 'text-[var(--color-gray-500)] bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)]'}`;
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
          e.preventDefault();
          fetchContacts(i);
        });
        pagination.appendChild(pageLink);
      }
  
      const nextButton = document.createElement('a');
      nextButton.href = '#';
      nextButton.className = 'pagination-btn flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-r-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      nextButton.innerHTML = '<span class="sr-only">Next</span><i class="bi bi-arrow-bar-right"></i>';
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) fetchContacts(currentPage + 1);
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
      pendingDelete = { contactId: null, page: null };
    }
  
    // Handle Delete Confirmation
    confirmDeleteBtn.addEventListener('click', async () => {
      try {
        const { contactId, page } = pendingDelete;
        if (!contactId) return;
  
        const response = await fetch("/admin/contacts/delete", {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactId, page }),
        });
        const result = await response.json();
  
        if (response.ok) {
          showMessage('Contact deleted successfully!', 'success');
          fetchContacts(page);
        } else {
          showMessage(result.message || 'Error deleting contact', 'error');
        }
        hideDeleteModal();
      } catch (error) {
        console.error('Error deleting contact:', error);
        showMessage('Network error: ' + error.message, 'error');
        hideDeleteModal();
      }
    });
  
    // Handle Cancel
    cancelDeleteBtn.addEventListener('click', () => {
      hideDeleteModal();
    });
  
    // Initial Fetch
    fetchContacts(currentPage);
  });