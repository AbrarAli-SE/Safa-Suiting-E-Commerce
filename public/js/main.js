





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
