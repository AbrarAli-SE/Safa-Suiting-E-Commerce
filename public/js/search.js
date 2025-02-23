document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("desktopSearchInput");
    const searchIcon = document.getElementById("desktopSearchIcon");
    const expandedSearchBar = document.getElementById("expandedSearchBar");
    const closeSearch = document.getElementById("closeSearch");
    const expandedSearchInput = document.getElementById("expandedSearchInput");
    const expandedSearchResults = document.getElementById("expandedSearchResults");
    let currentFocus = -1; // Track the currently focused suggestion
  
    // Ensure initial state on page load
    function initializeSearchBar() {
      expandedSearchBar.classList.add("hidden");
      searchInput.parentElement.classList.remove("hidden");
      expandedSearchResults.classList.add("hidden");
      expandedSearchInput.value = '';
      searchInput.value = '';
      currentFocus = -1;
    }
  
    // Show expanded search bar
    function showExpandedSearch(event) {
      event.stopPropagation(); // Prevent event bubbling
      expandedSearchBar.classList.remove("hidden");
      searchInput.parentElement.classList.add("hidden");
      expandedSearchInput.focus();
      if (searchInput.value.trim()) {
        expandedSearchInput.value = searchInput.value.trim();
        handleSearch(expandedSearchInput);
      }
    }
  
    // Hide expanded search bar
    function hideExpandedSearch() {
      expandedSearchBar.classList.add("hidden");
      searchInput.parentElement.classList.remove("hidden");
      expandedSearchResults.classList.add("hidden");
      expandedSearchInput.value = '';
      searchInput.value = '';
      currentFocus = -1;
    }
  
    // Event listeners for explicit user clicks
    searchInput.addEventListener("click", showExpandedSearch);
    searchIcon.addEventListener("click", showExpandedSearch);
  
    // Close search bar
    closeSearch.addEventListener("click", hideExpandedSearch);
  
    // Handle live search
    async function handleSearch(input) {
      const query = input.value.trim().toLowerCase();
      expandedSearchResults.innerHTML = '';
      currentFocus = -1;
  
      if (query.length > 0) {
        try {
          const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const results = await response.json();
  
          if (results.length > 0) {
            results.forEach((product, index) => {
              const resultItem = document.createElement("div");
              resultItem.textContent = product.name;
              resultItem.className = "search-result-item p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
              resultItem.setAttribute("data-index", index);
              resultItem.addEventListener("click", () => {
                window.location.href = `/search?q=${encodeURIComponent(expandedSearchInput.value.trim())}`;
              });
              expandedSearchResults.appendChild(resultItem);
            });
            expandedSearchResults.classList.remove("hidden");
          } else {
            expandedSearchResults.innerHTML = '<div class="p-2 text-gray-500">No results found</div>';
            expandedSearchResults.classList.remove("hidden");
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
          expandedSearchResults.innerHTML = '<div class="p-2 text-red-500">Error loading results</div>';
          expandedSearchResults.classList.remove("hidden");
        }
      } else {
        expandedSearchResults.classList.add("hidden");
      }
    }
  
    // Debounce function to limit search requests
    function debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  
    // Debounced search handler
    const debouncedSearch = debounce(handleSearch, 300);
    expandedSearchInput.addEventListener("input", () => debouncedSearch(expandedSearchInput));
  
    // Keyboard navigation
    expandedSearchInput.addEventListener("keydown", function (e) {
      const items = document.querySelectorAll(".search-result-item");
      if (items.length === 0) return;
  
      if (e.key === "ArrowDown") {
        e.preventDefault();
        currentFocus++;
        addActive(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentFocus--;
        addActive(items);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus > -1 && items[currentFocus]) {
          items[currentFocus].click();
        } else if (expandedSearchInput.value.trim()) {
          window.location.href = `/search?q=${encodeURIComponent(expandedSearchInput.value.trim())}`;
        }
      } else if (e.key === "Escape") {
        hideExpandedSearch();
      }
    });
  
    // Add active class to the focused item
    function addActive(items) {
      if (!items.length) return;
      removeActive(items);
      if (currentFocus >= items.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = items.length - 1;
      items[currentFocus].classList.add("bg-gray-200");
      expandedSearchInput.value = items[currentFocus].textContent;
    }
  
    // Remove active class from all items
    function removeActive(items) {
      items.forEach(item => item.classList.remove("bg-gray-200"));
    }
  
    // Hide results when clicking outside
    document.addEventListener("click", (e) => {
      if (!expandedSearchBar.contains(e.target) && !searchInput.contains(e.target) && !searchIcon.contains(e.target)) {
        hideExpandedSearch();
      }
    });
  
    // Reset search bar state on page load or navigation
    initializeSearchBar();
  
    // Handle back/forward navigation explicitly
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) { // Check if page is loaded from cache (back/forward)
        initializeSearchBar();
      }
    });
  });