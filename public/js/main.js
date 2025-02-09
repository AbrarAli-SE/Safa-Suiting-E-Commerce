// Function to toggle Dark Mode on and off it save the modein localstorage and also attack the event handler

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDarkMode = document.documentElement.classList.contains('dark');
  localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
}

const applySavedDarkMode = () => {
  const savedMode = localStorage.getItem('dark-mode');
  if (savedMode === 'enabled') {
    document.documentElement.classList.add('dark');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  applySavedDarkMode();

  const darkModeToggle = document.getElementById('darkModeToggle');
  darkModeToggle.addEventListener('click', toggleDarkMode);
});





                              // This is humburger when toggle then sidebar show and hide only in small screens

document.getElementById('hamburgerMenu').addEventListener('click', function () {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('-translate-x-full');
});


                              // Function to toggle the dropdown the hide button and show the dropdown also attached the event listeners

function navtoggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const button = document.getElementById('manageProductsButton');
  const icon = button.querySelector('i:last-child'); 

  if (dropdown.classList.contains('hidden')) {
    // Show dropdown
    dropdown.classList.remove('hidden', 'opacity-0', 'translate-y-5');
    dropdown.classList.add('flex', 'opacity-100', 'translate-y-0');
    // Change icon to "up"
    icon.classList.remove('bi-chevron-down');
    icon.classList.add('bi-chevron-up');
  } else {
    // Hide dropdown
    dropdown.classList.add('hidden', 'opacity-0', 'translate-y-5');
    dropdown.classList.remove('flex', 'opacity-100', 'translate-y-0');
    // Change icon to "down"
    icon.classList.remove('bi-chevron-up');
    icon.classList.add('bi-chevron-down');
  }
}

                              // Attach event listener to the button

document.getElementById('manageProductsButton').addEventListener('click', function () {
  navtoggleDropdown('manageProductsDropdown');
});


 

                                  // Function to highlight the active link of aside bar 

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("aside a"); 
  const currentPath = window.location.pathname; 

  links.forEach(link => {
    // Check if the link's href matches the current path
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("bg-[#DB4444]", "text-white"); 
      link.classList.remove("text-gray-900", "dark:text-gray-100"); 
    } else {
      link.classList.remove("bg-[#DB4444]", "text-white"); 
    }
  });
});


                                  // This is Sample Data for Orders (incoming & outgoing)
const orderData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Incoming Orders',
      data: [120, 150, 200, 250, 300, 350, 400],
      backgroundColor: '#6EE7B7',
      borderColor: '#6EE7B7',
      borderWidth: 1,
      fill: true
    },
    {
      label: 'Outgoing Orders',
      data: [50, 70, 100, 120, 150, 180, 200],
      backgroundColor: '#DB4444',
      borderColor: '#DB4444',
      borderWidth: 1,
      fill: true
    }
  ]
};

                                  // Sample Data for Revenue
const revenueData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Revenue',
      data: [1000, 2000, 2500, 3000, 3500, 4000, 4500],
      backgroundColor: '#4ADE80', // Green for revenue
      borderColor: '#4ADE80',
      borderWidth: 1,
      fill: true
    }
  ]
};

                                // Sample Data for Product Categories
const categoryData = {
  labels: ['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Home'],
  datasets: [
    {
      label: 'Products Sold',
      data: [300, 450, 100, 150, 200],
      backgroundColor: '#DB4444',
      borderColor: '#DB4444',
      borderWidth: 1
    }
  ]
};

                                // Sample Data for Customer Growth
const growthData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Customer Growth',
      data: [100, 200, 300, 400, 500, 600, 700],
      backgroundColor: '#FDBA74', // Yellow for growth
      borderColor: '#FDBA74',
      borderWidth: 1,
      fill: true
    }
  ]
};

                                  // Common Chart Options
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.dataset.label + ': ' + context.raw + ' Items';
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 50
      }
    }
  }
};

                                // Create the Order Chart

// Function to Initialize Charts
function initializeChart(chartId, chartType, chartData, chartOptions) {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    console.warn(`${chartId} not found.`);
    return;
  }

  try {
    const ctx = chartElement.getContext('2d');
    new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: chartOptions,
    });
  } catch (error) {
    console.error(`Error initializing chart for ${chartId}:`, error);
  }
}

// Common Options (if any)
const commonOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
  },
};

// Data and Initialization for Each Chart
const charts = [
  {
    id: 'orderChart',
    type: 'line',
    data: orderData,
    options: commonOptions,
  },
  {
    id: 'revenueChart',
    type: 'line',
    data: revenueData,
    options: commonOptions,
  },
  {
    id: 'categoryChart',
    type: 'bar',
    data: categoryData,
    options: {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 50,
          },
        },
      },
    },
  },
  {
    id: 'growthChart',
    type: 'line',
    data: growthData,
    options: commonOptions,
  },
];

// Initialize All Charts
charts.forEach(({ id, type, data, options }) => {
  initializeChart(id, type, data, options);
});


                                            // Search Products function
function searchProducts() {
  try {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const productRows = document.querySelectorAll('#productList tr');

    productRows.forEach(row => {
      const productName = row.cells[1].textContent.toLowerCase();
      const category = row.cells[2].textContent.toLowerCase();
      const price = row.cells[3].textContent.toLowerCase();

      // Check if search query matches product name, category, or price
      if (productName.includes(searchQuery) || category.includes(searchQuery) || price.includes(searchQuery)) {
        row.style.display = ''; // Show the row
      } else {
        row.style.display = 'none'; // Hide the row
      }
    });
  } catch (error) {
    console.error('Error during product search:', error);
  }
}

// Add event listener for search button
try {
  const searchButton = document.getElementById('search-btn');
  if (searchButton) {
    searchButton.addEventListener('click', searchProducts);
  } else {
    console.warn('Search button not found');
  }
} catch (error) {
  console.error('Error attaching search button event listener:', error);
}

// Optional: Add event listener for pressing Enter on the search field
try {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        searchProducts();
      }
    });
  } else {
    console.warn('Search input field not found');
  }
} catch (error) {
  console.error('Error attaching Enter key event listener:', error);
}

                                // Pagination js for previous and next go through 

document.addEventListener("DOMContentLoaded", () => {
  const paginationLinks = document.querySelectorAll(".pagination-link");

  paginationLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active state from all links
      paginationLinks.forEach((lnk) => {
        lnk.classList.remove("z-10", "text-red-600", "border-red-300", "bg-red-50", "dark:bg-gray-700", "dark:text-white");
        lnk.classList.add("text-gray-500", "bg-white", "dark:text-gray-400", "dark:bg-gray-800");
      });

      // Add active state to the clicked link
      link.classList.add("z-10", "text-red-600", "border-red-300", "bg-red-50", "dark:bg-gray-700", "dark:text-white");
      link.classList.remove("text-gray-500", "bg-white", "dark:text-gray-400", "dark:bg-gray-800");
    });
  });
});




                                // JavaScript to handle form submission and display created coupons

                                
try {
  const couponForm = document.getElementById('couponForm');
  
  if (!couponForm) {
    console.warn('Element with id="couponForm" not found.');
  } else {
    couponForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent default form submission

      // Get form values
      const couponCode = document.getElementById('coupon_code').value;
      const couponName = document.getElementById('coupon_name').value;
      const specificProduct = document.getElementById('specific_product').value;
      const couponType = document.getElementById('coupon_type').value;
      const discountAmount = document.getElementById('discount_amount').value;
      const minOrderValue = document.getElementById('min_order_value').value;
      const startDate = document.getElementById('start_date').value;
      const expiryDate = document.getElementById('expiry_date').value;
      const usageLimit = document.getElementById('usage_limit').value;

      // Validate inputs
      if (!couponCode || !couponName || !discountAmount || !startDate || !expiryDate || !usageLimit || !couponType) {
        alert('Please fill in all required fields.');
        return;
      }

      // Create a new list item for the coupon
      const couponList = document.getElementById('couponList');
      const listItem = document.createElement('li');
      listItem.classList.add(
        'flex',
        'justify-between',
        'items-center',
        'p-3',
        'border',
        'rounded-lg',
        'bg-gray-200',
        'dark:bg-gray-700',
        'text-gray-900',
        'dark:text-gray-300'
      );

      // Coupon details
      listItem.innerHTML = `
        <span>
          <strong>${couponName} (${couponCode})</strong> - ${discountAmount}
          <br>
          Type: ${couponType}, Usage Limit: ${usageLimit}, Valid from ${startDate} to ${expiryDate}
          ${specificProduct ? `<br>Specific Product: ${specificProduct}` : ''}
          ${minOrderValue ? `<br>Minimum Order Value: $${minOrderValue}` : ''}
        </span>
        <button class="deleteButton bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>
      `;

      // Append the new coupon to the list
      couponList.appendChild(listItem);

      // Add event listener to the delete button
      const deleteButton = listItem.querySelector('.deleteButton');
      deleteButton.addEventListener('click', function () {
        couponList.removeChild(listItem);
      });

      // Reset the form
      this.reset();
    });
  }
} catch (error) {
  console.error('An error occurred while setting up the coupon form:', error);
}





document.addEventListener('DOMContentLoaded', () => {
  try {
    // Get the DOM elements
    const searchButton = document.getElementById('paymentSearchBtn');
    const searchPaymentIdInput = document.getElementById('searchPaymentId');
    const paymentStatusFilter = document.getElementById('paymentStatusFilter');

    // Check if the required elements exist, if not, abort script execution
    if (!searchButton || !searchPaymentIdInput || !paymentStatusFilter) {
      console.warn('Some required elements are missing, skipping event listener setup.');
      return; // Exit early if any required element is missing
    }

    // Function to search for a payment by Payment ID
    function searchPayment() {
      const searchPaymentId = searchPaymentIdInput.value;
      const rows = document.querySelectorAll('#paymentsTable tbody tr');

      rows.forEach(row => {
        const paymentId = row.getAttribute('data-payment-id');
        if (searchPaymentId && paymentId !== searchPaymentId) {
          row.style.display = 'none'; // Hide row if it doesn't match the search
        } else {
          row.style.display = ''; // Show row if it matches the search or search is empty
        }
      });
    }

    // Function to filter payments by status (Received, Refunded, Pending)
    function filterByPaymentStatus() {
      const selectedStatus = paymentStatusFilter.value;
      const rows = document.querySelectorAll('#paymentsTable tbody tr');

      rows.forEach(row => {
        const paymentStatus = row.getAttribute('data-status');
        if (selectedStatus && paymentStatus !== selectedStatus) {
          row.style.display = 'none'; // Hide row if status doesn't match filter
        } else {
          row.style.display = ''; // Show row if status matches filter or filter is empty
        }
      });
    }

    // Event listener for the search button
    searchButton.addEventListener('click', searchPayment);

    // Event listener for the status filter dropdown
    paymentStatusFilter.addEventListener('change', filterByPaymentStatus);

  } catch (error) {
    console.error("Error in setting up event listeners:", error);
  }
});



document.addEventListener('DOMContentLoaded', () => {
  try {
    // Get the elements for search, filter, and tracking assignment
    const searchButton = document.getElementById('orderSearchBtn');
    const searchOrderIdInput = document.getElementById('searchOrderId');
    const statusFilter = document.getElementById('statusFilter');
    const orderIdInput = document.getElementById('orderId');
    const trackingIdInput = document.getElementById('trackingId');
    const assignTrackingButton = document.querySelector('button.sm\\:mt-0');

    // Check if the required elements exist, otherwise exit the function
    if (!searchButton || !searchOrderIdInput || !statusFilter || !orderIdInput || !trackingIdInput || !assignTrackingButton) {
      console.warn('Some required elements are missing, skipping event listener setup.');
      return; // Exit early if any required element is missing
    }

    // Function to assign Tracking ID to the order
    function assignTrackingId() {
      const orderId = orderIdInput.value;
      const trackingId = trackingIdInput.value;
      if (!orderId || !trackingId) {
        alert("Please enter both Order ID and Tracking ID");
        return;
      }
      console.log(`Assigning Tracking ID: ${trackingId} to Order ID: ${orderId}`);

      // For now, let's update the status in the table
      const rows = document.querySelectorAll('#ordersTable tbody tr');
      rows.forEach(row => {
        const rowOrderId = row.querySelector('td').textContent;
        if (rowOrderId === orderId) {
          row.cells[3].textContent = trackingId;
          row.cells[4].textContent = "Shipped";
          row.cells[4].classList.remove('text-yellow-500');
          row.cells[4].classList.add('text-green-500');
        }
      });
    }

    // Function to search for an order by Order ID
    function searchOrder() {
      const searchOrderId = searchOrderIdInput.value;
      const rows = document.querySelectorAll('#ordersTable tbody tr');

      rows.forEach(row => {
        const orderId = row.getAttribute('data-order-id');
        if (searchOrderId && orderId !== searchOrderId) {
          row.style.display = 'none'; // Hide row if it doesn't match the search
        } else {
          row.style.display = ''; // Show row if it matches the search or search is empty
        }
      });
    }

    // Function to filter orders by status (Pending/Shipped)
    function filterByStatus() {
      const selectedStatus = statusFilter.value;
      const rows = document.querySelectorAll('#ordersTable tbody tr');

      rows.forEach(row => {
        const orderStatus = row.getAttribute('data-status');
        if (selectedStatus && orderStatus !== selectedStatus) {
          row.style.display = 'none'; // Hide row if status doesn't match filter
        } else {
          row.style.display = ''; // Show row if status matches filter or filter is empty
        }
      });
    }

    // Add event listeners for the search button, status filter, and assign tracking button
    searchButton.addEventListener('click', searchOrder);
    statusFilter.addEventListener('change', filterByStatus);
    assignTrackingButton.addEventListener('click', assignTrackingId);

  } catch (error) {
    console.error("Error in setting up event listeners:", error);
  }
});


// Function to delete an order
function deleteOrder(orderId) {
  try {
    // Find the row corresponding to the orderId
    const orderRow = document.querySelector(`tr[data-order-id="${orderId}"]`);
    
    if (!orderRow) {
      throw new Error('Order row not found');
    }

    // Remove the order row from the table
    orderRow.remove();

    console.log(`Order ID: ${orderId} has been deleted.`);
  } catch (error) {
    console.error('Error:', error.message);

    // Fallback: you can execute other code here if orderRow doesn't exist
    // For example, show an alert
    alert('Order not found or already deleted.');
  }
}

// Adding event listeners for all delete buttons
document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('button[id^="deleteOrder"]');
  
  deleteButtons.forEach(button => {
    // Extract the order ID from the button's ID
    const orderId = button.id.replace('deleteOrder', '');
    
    // Add the event listener
    button.addEventListener('click', function() {
      deleteOrder(orderId);
    });
  });
});

window.openNotifications = function () {
  fetch("/admin/notifications/mark-read", { method: "POST" })
      .then(() => {
          document.getElementById("notificationCount").classList.add("hidden");
          fetchNotifications();
      })
      .catch(error => console.error("❌ Error marking notifications as read:", error));

  const dropdown = document.getElementById("notificationDropdown");
  dropdown.classList.toggle("hidden");
};
