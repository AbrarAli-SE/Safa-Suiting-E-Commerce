// Chart.js Initialization with Hex Codes (Red and Black Combination)
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Prepare Order Data
const orderData = {
  labels: analyticsData.orderAnalytics.map(item => months[item._id - 1]),
  datasets: [{
    label: 'Incoming Orders',
    data: analyticsData.orderAnalytics.map(item => item.incoming),
    backgroundColor: '#FF0000', // Red fill
    borderColor: '#000000', // Black outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#000000', // Black points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }, {
    label: 'Outgoing Orders',
    data: analyticsData.orderAnalytics.map(item => item.outgoing),
    backgroundColor: '#000000', // Black fill
    borderColor: '#FF0000', // Red outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#FF0000', // Red points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }]
};

// Prepare Revenue Data
const revenueData = {
  labels: analyticsData.revenueAnalytics.map(item => months[item._id - 1]),
  datasets: [{
    label: 'Revenue',
    data: analyticsData.revenueAnalytics.map(item => item.revenue),
    backgroundColor: '#FF0000', // Red fill
    borderColor: '#000000', // Black outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#000000', // Black points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }]
};

// Prepare Category Data
const categoryData = {
  labels: analyticsData.categoryAnalytics.map(item => item._id || 'Unknown'),
  datasets: [{
    label: 'Products Sold',
    data: analyticsData.categoryAnalytics.map(item => item.count),
    backgroundColor: analyticsData.categoryAnalytics.map((_, index) => index % 2 === 0 ? '#FF0000' : '#000000'), // Alternating red and black
    borderColor: analyticsData.categoryAnalytics.map((_, index) => index % 2 === 0 ? '#000000' : '#FF0000'), // Alternating black and red outlines
    borderWidth: 2,
    barThickness: 20 // Adjust bar width for better visibility
  }]
};

// Prepare Growth Data
const growthData = {
  labels: analyticsData.growthAnalytics.map(item => months[item._id - 1]),
  datasets: [{
    label: 'Customer Growth',
    data: analyticsData.growthAnalytics.map(item => item.count),
    backgroundColor: '#000000', // Black fill
    borderColor: '#FF0000', // Red outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#FF0000', // Red points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }]
};

// Common Chart Options with Gray Axes and Labels
const commonOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top', display: true, labels: { color: '#6B7280' } }, // Gray (#6B7280)
    title: { display: true, text: '', color: '#FF0000' }, // Red title (handled by HTML h2)
    tooltip: {
      callbacks: { 
        label: function (context) {
          // Get the raw value
          let value = context.raw;
          // Format as integer (no decimals) with commas
          let formattedValue = Math.round(value).toLocaleString('en-PK'); // Pakistani English formatting
          return context.dataset.label + ': ' + 
            (context.dataset.label.includes('Revenue') ? 'PKR ' + formattedValue : formattedValue + ' Items');
        },
        labelColor: function (context) {
          return { borderColor: '#6B7280', backgroundColor: '#FFFFFF' }; // Gray and white for tooltip
        }
      }
    }
  },
  scales: {
    x: { ticks: { color: '#6B7280' }, grid: { color: '#F9FAFB' } }, // Gray and light gray for grid
    y: { beginAtZero: true, ticks: { color: '#6B7280', stepSize: 50 }, grid: { color: '#F9FAFB' } } // Gray and light gray for grid
  }
};

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

// Initialize All Charts
document.addEventListener('DOMContentLoaded', () => {
  const charts = [
    { id: 'orderChart', type: 'line', data: orderData, options: commonOptions },
    { id: 'revenueChart', type: 'line', data: revenueData, options: commonOptions },
    { id: 'categoryChart', type: 'bar', data: categoryData, options: { ...commonOptions, scales: { y: { beginAtZero: true, ticks: { stepSize: 50 } } } } },
    { id: 'growthChart', type: 'line', data: growthData, options: commonOptions },
  ];

  charts.forEach(({ id, type, data, options }) => {
    initializeChart(id, type, data, options);
  });
});

// Drawer Toggle Script
const menuToggle = document.getElementById('menuToggle');
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');

menuToggle.addEventListener('click', () => {
  drawer.classList.toggle('left-0');
  drawer.classList.toggle('left-[-260px]');
  overlay.classList.toggle('opacity-0');
  overlay.classList.toggle('invisible');
  overlay.classList.toggle('opacity-1');
  overlay.classList.toggle('visible');
  mainContent.classList.toggle('blur-sm');
});

overlay.addEventListener('click', () => {
  drawer.classList.remove('left-0');
  drawer.classList.add('left-[-260px]');
  overlay.classList.remove('opacity-1', 'visible');
  overlay.classList.add('opacity-0', 'invisible');
  mainContent.classList.remove('blur-sm');
});

const links = document.querySelectorAll(".active-link");

  // Highlight active link based on current URL
  const currentPath = window.location.pathname;
  links.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("bg-[var(--color-red-500)]", "text-[var(--color-white)]");
    } else {
      link.classList.remove("bg-[var(--color-red-500)]", "text-[var(--color-white)]");
    }
  });