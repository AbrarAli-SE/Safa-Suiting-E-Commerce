// public/js/headerScripts.js

document.addEventListener("DOMContentLoaded", function () {
    const desktopSearchIcon = document.getElementById('desktopSearchIcon');
    const expandedSearchBar = document.getElementById('expandedSearchBar');
    const closeSearch = document.getElementById('closeSearch');
    const expandedSearchInput = document.getElementById('expandedSearchInput');
    const expandedSearchResults = document.getElementById('expandedSearchResults');
    const headerContent = document.getElementById('headerContent');
    let currentFocus = -1;
  
    function initializeSearchBar() {
      expandedSearchBar.classList.add("hidden");
      headerContent?.classList.remove("hidden");
      expandedSearchResults.classList.add("hidden");
      expandedSearchInput.value = '';
      currentFocus = -1;
    }
  
    function showExpandedSearch(event) {
      event.stopPropagation();
      expandedSearchBar.classList.remove("hidden");
      headerContent?.classList.add("hidden");
      expandedSearchInput.focus();
      handleSearch(expandedSearchInput);
    }
  
    function hideExpandedSearch() {
      expandedSearchBar.classList.add("hidden");
      headerContent?.classList.remove("hidden");
      expandedSearchResults.classList.add("hidden");
      expandedSearchInput.value = '';
      currentFocus = -1;
    }
  
    desktopSearchIcon.addEventListener('click', showExpandedSearch);
    closeSearch.addEventListener('click', hideExpandedSearch);
  
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
            const limitedResults = results.slice(0, 10);
            limitedResults.forEach((product, index) => {
              const resultItem = document.createElement("div");
              resultItem.textContent = product.name;
              // Use Tailwind classes with custom colors from config
              resultItem.className = "search-result-item p-2 bg-[var(--color-white)] text-[var(--color-black)] cursor-pointer hover:bg-[var(--color-red-500)] hover:text-[var(--color-white)]";
              resultItem.setAttribute("data-index", index);
              resultItem.addEventListener("click", () => {
                window.location.href = `/search?q=${encodeURIComponent(expandedSearchInput.value.trim())}`;
              });
              expandedSearchResults.appendChild(resultItem);
            });
            expandedSearchResults.classList.remove("hidden");
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
          expandedSearchResults.innerHTML = '<div class="p-2 text-[var(--color-red-500)]">Error loading results</div>';
          expandedSearchResults.classList.remove("hidden");
        }
      } else {
        expandedSearchResults.classList.add("hidden");
      }
    }
  
    const debouncedSearch = debounce(handleSearch, 300);
    expandedSearchInput.addEventListener("input", () => debouncedSearch(expandedSearchInput));
  
    expandedSearchInput.addEventListener("keydown", function (e) {
      const items = document.querySelectorAll(".search-result-item");
      
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
        if (expandedSearchInput.value.trim()) {
          window.location.href = `/search?q=${encodeURIComponent(expandedSearchInput.value.trim())}`;
        }
      } else if (e.key === "Escape") {
        hideExpandedSearch();
      }
    });
  
    // Add active state for keyboard navigation using same red color
    function addActive(items) {
      if (!items.length) return;
      removeActive(items);
      if (currentFocus >= items.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = items.length - 1;
      
      // Use same red color as hover
      items[currentFocus].classList.add("bg-[var(--color-red-500)]", "text-[var(--color-white)]", "active-keyboard");
      expandedSearchInput.value = items[currentFocus].textContent;
    }
  
    // Remove active state and reset to base styles
    function removeActive(items) {
      items.forEach(item => {
        item.classList.remove("bg-[var(--color-red-500)]", "text-[var(--color-white)]", "active-keyboard");
        // Reset with hover using same red color
        item.className = "search-result-item p-2 bg-[var(--color-white)] text-[var(--color-black)] cursor-pointer hover:bg-[var(--color-red-500)] hover:text-[var(--color-white)]";
      });
    }
  
    document.addEventListener("click", (e) => {
      if (!expandedSearchBar.contains(e.target) && !desktopSearchIcon.contains(e.target)) {
        hideExpandedSearch();
      }
    });
  
    function debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  
    initializeSearchBar();
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        initializeSearchBar();
      }
    });
  });

  // Highlight Active Link (unchanged from previous logic)
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
          link.classList.add('text-[var(--color-red-500)]');
          link.classList.remove('text-[var(--color-black)]');
      }
  });

//   // Toggle Hamburger Menu (unchanged from previous logic)
//   const hamburgerBtn = document.getElementById('hamburgerBtn');
//   const fullScreenNav = document.getElementById('fullScreenNav');
//   const closeNavBtn = document.getElementById('closeNavBtn');

//   hamburgerBtn.addEventListener('click', () => {
//       fullScreenNav.classList.remove('opacity-0', 'pointer-events-none');
//       fullScreenNav.classList.add('opacity-100', 'pointer-events-auto');
//   });

//   closeNavBtn.addEventListener('click', () => {
//       fullScreenNav.classList.remove('opacity-100', 'pointer-events-auto');
//       fullScreenNav.classList.add('opacity-0', 'pointer-events-none');
//   });
