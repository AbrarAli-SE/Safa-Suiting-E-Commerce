// Sample Data for Orders (incoming & outgoing)
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

// Sample Data for Customer Growth (New Chart)
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
const ctxOrder = document.getElementById('orderChart').getContext('2d');
new Chart(ctxOrder, {
  type: 'line',
  data: orderData,
  options: options
});

// Create the Revenue Chart
const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
new Chart(ctxRevenue, {
  type: 'line',
  data: revenueData,
  options: options
});

// Create the Product Categories Chart (Bar chart)
const ctxCategory = document.getElementById('categoryChart').getContext('2d');
new Chart(ctxCategory, {
  type: 'bar',
  data: categoryData,
  options: {
    ...options,
    scales: {
      ...options.scales,
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50
        }
      }
    }
  }
});

// Create the Customer Growth Chart (New Chart)
const ctxGrowth = document.getElementById('growthChart').getContext('2d');
new Chart(ctxGrowth, {
  type: 'line',
  data: growthData,
  options: options
});


// Toggle Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDarkMode = document.documentElement.classList.contains('dark');
  localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
}

// Apply saved Dark Mode preference
window.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('dark-mode');
  if (savedMode === 'enabled') {
    document.documentElement.classList.add('dark');
  }
});

// Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('-translate-x-full');
}

// Toggle Dropdown
function navtoggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const icon = document.getElementById(id + 'Icon');
  if (dropdown.classList.contains('hidden')) {
    dropdown.classList.remove('hidden', 'opacity-0', 'translate-y-5');
    dropdown.classList.add('flex', 'opacity-100', 'translate-y-0');
    icon.classList.add('rotate-180');
  } else {
    dropdown.classList.add('hidden', 'opacity-0', 'translate-y-5');
    dropdown.classList.remove('flex', 'opacity-100', 'translate-y-0');
    icon.classList.remove('rotate-180');
  }
}

function toggleDropdown() {
  const dropdown = document.getElementById('notificationDropdown');
  dropdown.classList.toggle('hidden');
}

// JavaScript to handle form submission and display created coupons
document.getElementById('couponForm').addEventListener('submit', function (event) {
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


  
  const slider = document.getElementById("slider");
  const slides = [];
  const contexts = [];
  let currentIndex = 0;

  // Default Image and Context
  const defaultImage = {
    src: "download (4).jpeg", // Replace with your placeholder image URL
    boldText: "Welcome to the Carousel!",
    normalText: "Upload images and context to personalize this slider.",
  };

  // Initialize the slider with the default image
  function initializeSlider() {
    const img = document.createElement("img");
    img.src = defaultImage.src;
    img.alt = "Default Image";
    img.className =
      "slider-item w-80 h-60 rounded-lg shadow-lg transform scale-75 transition-transform duration-300";
    const textContainer = document.createElement("div");
    textContainer.className = "absolute text-center text-white w-80";
    const boldText = document.createElement("p");
    boldText.className = "font-bold text-lg mb-2";
    boldText.textContent = defaultImage.boldText;
    const normalText = document.createElement("p");
    normalText.className = "text-sm";
    normalText.textContent = defaultImage.normalText;
    textContainer.appendChild(boldText);
    textContainer.appendChild(normalText);
    const wrapper = document.createElement("div");
    wrapper.className = "relative";
    wrapper.appendChild(img);
    wrapper.appendChild(textContainer);
    slider.appendChild(wrapper);
    slides.push(wrapper);
    contexts.push({ bold: defaultImage.boldText, normal: defaultImage.normalText });
    updateStackSlider();
  }

  // Function to preview images and add them to the slider
  function previewImage(event, index) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (slides[index]) {
          slides[index].querySelector("img").src = e.target.result;
        } else {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = `Image ${index + 1}`;
          img.className =
            "slider-item w-80 h-60 rounded-lg shadow-lg transform scale-75 transition-transform duration-300";
          const textContainer = document.createElement("div");
          textContainer.className = "absolute text-center text-white w-80";
          const boldText = document.createElement("p");
          boldText.className = "font-bold text-lg mb-2";
          const normalText = document.createElement("p");
          normalText.className = "text-sm";
          textContainer.appendChild(boldText);
          textContainer.appendChild(normalText);
          const wrapper = document.createElement("div");
          wrapper.className = "relative";
          wrapper.appendChild(img);
          wrapper.appendChild(textContainer);
          slider.appendChild(wrapper);
          slides[index] = wrapper;
          contexts[index] = { bold: "", normal: "" };
        }
        updateStackSlider();
      };
      reader.readAsDataURL(file);
    }
  }

  // Function to update the text content of the images
  function updateContext(index, type, value) {
    contexts[index][type] = value;
    if (slides[index]) {
      const [boldText, normalText] = slides[index].querySelectorAll("p");
      boldText.textContent = contexts[index].bold;
      normalText.textContent = contexts[index].normal;
    }
  }

  function uploadSlider() {
    const formData = new FormData(document.getElementById("carousel-form"));
    const sliderData = contexts.map((context, i) => ({
      image: formData.get(`image${i + 1}`),
      boldText: context.bold,
      normalText: context.normal,
    }));
    console.log("Slider Data:", sliderData);
    alert("Slider uploaded successfully!");
  }

  // Function to update the slider
  function updateStackSlider() {
    slides.forEach((slide, index) => {
      const offset = index - currentIndex;
      slide.style.transform = `translateX(${offset * 100}%) scale(${index === currentIndex ? 1 : 0.75
        })`;
      slide.style.opacity = index === currentIndex ? 1 : 0.5;
      slide.style.zIndex = index === currentIndex ? 10 : 1;
    });
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateStackSlider();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateStackSlider();
  }

  // Call initializeSlider to load the default image
  initializeSlider();



  // Function to delete an order
  function deleteOrder(orderId) {
    // Ask for confirmation before deleting the order
    if (confirm(`Are you sure you want to delete order ID: ${orderId}?`)) {
      // Delete the order row from the table
      const orderRow = document.querySelector(`#canceledOrdersTable tr[data-order-id="${orderId}"]`);
      if (orderRow) {
        orderRow.remove(); // Remove the row from the DOM
      }

      // Send a request to the server to delete the order from MongoDB
      fetch(`/admin/delete-canceled-order/${orderId}`, {
        method: 'DELETE',
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert(`Order ID ${orderId} deleted successfully!`);
          } else {
            alert(`Failed to delete Order ID ${orderId}. Please try again.`);
          }
        })
        .catch(error => {
          alert('Error deleting order: ' + error.message);
        });
    }
  }


    // Function to search for a payment by Payment ID
function searchPayment() {
  const searchPaymentId = document.getElementById('searchPaymentId').value;
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
  const selectedStatus = document.getElementById('paymentStatusFilter').value;
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


 // Example function to assign the tracking ID to an order
 function assignTrackingId() {
  const orderId = document.getElementById('orderId').value;
  const trackingId = document.getElementById('trackingId').value;
  if (!orderId || !trackingId) {
    alert("Please enter both Order ID and Tracking ID");
    return;
  }
  console.log(`Assigning Tracking ID: ${trackingId} to Order ID: ${orderId}`);
  // Add functionality to update the tracking ID for the order in the database

  // For now, let's update the status in the table (you can remove this part when implementing real functionality)
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
  const searchOrderId = document.getElementById('searchOrderId').value;
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
  const selectedStatus = document.getElementById('statusFilter').value;
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


// Example functions for filtering, searching, and updating
function searchUsers() {
  const name = document.getElementById('searchName').value;
  const email = document.getElementById('searchEmail').value;
  console.log(`Searching for Name: ${name}, Email: ${email}`);
  // Add functionality to fetch and display results based on search
}

function updateUserRole(userId) {
  console.log(`Updating role for user ID: ${userId}`);
  // Add functionality to update the user's role in the database
}



  // Search Products function
  function searchProducts() {
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
  }

  // Optional: Add event listener for pressing Enter on the search field
  document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchProducts();
    }
  });

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
