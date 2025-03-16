// public/js/userManagement.js
document.addEventListener("DOMContentLoaded", function () {
    const userList = document.getElementById("userList");
    const messageContainer = document.getElementById("message-container");
    const pagination = document.getElementById("pagination");
    const noResults = document.getElementById("noResults");
    const userFilter = document.getElementById("userFilter");
    let currentPage = 1;
    const currentUserId = "<%= user && user._id ? user._id : '' %>";
  
    fetchUsers(currentPage);
  
    userFilter.addEventListener("change", function () {
      fetchUsers(1);
    });
  
    userList.addEventListener("click", async function (e) {
      const button = e.target.closest(".update-role-btn");
      if (!button) return;
  
      const userId = button.dataset.userId;
      const role = button.previousElementSibling.value;
  
      if (userId === currentUserId) {
        showMessage("You cannot change your own role.", "error");
        return;
      }
  
      try {
        const response = await fetch("/admin/users/update-role", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role, page: currentPage }),
          credentials: "include",
        });
  
        const result = await response.json();
        messageContainer.innerHTML = "";
  
        if (response.ok) {
          showMessage(result.message, "success");
          updateUserTable(result.users);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          showMessage(result.error || "An error occurred.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Role Update Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    });
  
    pagination.addEventListener("click", async function (e) {
      const target = e.target.closest(".pagination-link");
      if (!target) return;
  
      e.preventDefault();
      const page = parseInt(target.dataset.page);
      fetchUsers(page);
    });
  
    async function fetchUsers(page) {
      const filter = userFilter.value;
      try {
        const response = await fetch(`/admin/users?page=${page}&filter=${filter}`, {
          headers: { "X-Requested-With": "XMLHttpRequest" },
          credentials: "include",
        });
  
        const result = await response.json();
  
        if (response.ok) {
          updateUserTable(result.users);
          updatePagination(result.currentPage, result.totalPages);
          currentPage = result.currentPage;
        } else {
          console.error("❌ Fetch Users Error:", result.error);
          showMessage("Error fetching users.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Fetch Error:", error);
        showMessage("Network error. Please try again.", "error");
      }
    }
  
    function updateUserTable(users) {
      userList.innerHTML = "";
      if (!users || users.length === 0) {
        userList.innerHTML = '<tr><td colspan="5" class="text-center text-[var(--color-red-500)] font-semibold py-4">No users found.</td></tr>';
        noResults.classList.remove("hidden");
      } else {
        users.forEach(user => {
          const row = `
            <tr class="border-t border-[var(--color-gray-200)] user-row" data-role="${user.role}">
              <td class="px-4 py-2 user-name">${user.name}</td>
              <td class="px-4 py-2 user-email">${user.email}</td>
              <td class="px-4 py-2">
                <select class="bg-[var(--color-gray-50)] text-[var(--color-gray-700)] p-2 rounded-md border border-[var(--color-gray-300)] focus:ring-2 focus:ring-[var(--color-red-500)] focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md">
                  <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                  <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                </select>
                <button class="update-role-btn ml-2 text-[var(--color-red-500)] hover:text-[var(--color-red-700)] transition-colors duration-300" data-user-id="${user._id}"><i class="bi bi-arrow-repeat"></i></button>
              </td>
              <td class="px-4 py-2">${user.lastActive ? new Date(user.lastActive).toLocaleString() : 'N/A'}</td>
              <td class="px-4 py-2 flex items-center gap-3">
                <a href="/admin/users/${user._id}" class="text-[var(--color-blue-500)] hover:text-[var(--color-blue-700)] transition-colors duration-300"><i class="bi bi-eye"></i></a>
              </td>
            </tr>`;
          userList.insertAdjacentHTML("beforeend", row);
        });
        noResults.classList.add("hidden");
      }
    }
  
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
        if (currentPage > 1) fetchUsers(currentPage - 1);
      });
      pagination.appendChild(prevButton);
  
      for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `pagination-link flex items-center justify-center px-3 h-8 leading-tight border border-[var(--color-gray-300)] transition-all duration-300 ${i === currentPage ? 'text-[var(--color-red-500)] bg-[var(--color-red-50)] hover:bg-[var(--color-red-100)] hover:text-[var(--color-red-700)]' : 'text-[var(--color-gray-500)] bg-[var(--color-white)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)]'}`;
        pageLink.dataset.page = i;
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
          e.preventDefault();
          fetchUsers(i);
        });
        pagination.appendChild(pageLink);
      }
  
      const nextButton = document.createElement('a');
      nextButton.href = '#';
      nextButton.className = 'pagination-btn flex items-center justify-center px-3 h-8 leading-tight text-[var(--color-gray-500)] bg-[var(--color-white)] border border-[var(--color-gray-300)] rounded-r-lg hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-all duration-300';
      nextButton.innerHTML = '<span class="sr-only">Next</span><i class="bi bi-arrow-bar-right"></i>';
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) fetchUsers(currentPage + 1);
      });
      pagination.appendChild(nextButton);
    }
  
    function showMessage(text, type) {
      const div = document.createElement("div");
      div.className = `bg-[var(--color-${type === "success" ? "green" : "red"}-100)] text-[var(--color-${type === "success" ? "green" : "red"}-700)] p-3 rounded-lg text-center`;
      div.textContent = text;
      messageContainer.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }
  });