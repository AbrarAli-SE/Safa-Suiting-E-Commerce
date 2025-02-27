// public/js/admin.js

// Drawer and Overlay Toggle
const menuToggle = document.getElementById('menuToggle');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');

if (menuToggle && drawer && overlay && mainContent) {
  menuToggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
    mainContent.classList.toggle('dimmed');
  });

  overlay.addEventListener('click', () => {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    mainContent.classList.remove('dimmed');
  });
} else {
  console.warn('One or more DOM elements for drawer functionality not found.');
}

// Highlight Active Link in Drawer
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.drawer ul li a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Chart.js Initialization
const orderData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'Incoming Orders',
    data: [120, 150, 200, 250, 300, 350, 400],
    backgroundColor: '#6EE7B7',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    fill: true
  }, {
    label: 'Outgoing Orders',
    data: [50, 70, 100, 120, 150, 180, 200],
    backgroundColor: '#DB4444',
    borderColor: '#DB4444',
    borderWidth: 1,
    fill: true
  }]
};

const revenueData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'Revenue',
    data: [1000, 2000, 2500, 3000, 3500, 4000, 4500],
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
    borderWidth: 1,
    fill: true
  }]
};

const categoryData = {
  labels: ['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Home'],
  datasets: [{
    label: 'Products Sold',
    data: [300, 450, 100, 150, 200],
    backgroundColor: '#DB4444',
    borderColor: '#DB4444',
    borderWidth: 1
  }]
};

const growthData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'Customer Growth',
    data: [100, 200, 300, 400, 500, 600, 700],
    backgroundColor: '#FDBA74',
    borderColor: '#FDBA74',
    borderWidth: 1,
    fill: true
  }]
};

const commonOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top', display: true },
    tooltip: {
      callbacks: { label: function (context) { return context.dataset.label + ': ' + context.raw + (context.dataset.label.includes('Revenue') ? '$' : ' Items'); } }
    }
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 50 } }
  }
};

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

document.addEventListener('DOMContentLoaded', () => {
  // Highlight active link on page load
  highlightActiveLink();

  // Initialize charts
  const charts = [
    { id: 'orderChart', type: 'line', data: orderData, options: commonOptions },
    { id: 'revenueChart', type: 'line', data: revenueData, options: commonOptions },
    { id: 'categoryChart', type: 'bar', data: categoryData, options: { ...commonOptions, scales: { y: { beginAtZero: true, ticks: { stepSize: 50 } } } } },
    { id: 'growthChart', type: 'line', data: growthData, options: commonOptions },
  ];

  charts.forEach(({ id, type, data, options }) => {
    initializeChart(id, type, data, options);
  });

  // Update active link on navigation
  window.addEventListener('popstate', highlightActiveLink);
});