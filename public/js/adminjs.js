
// Chart.js Initialization with Hex Codes (Red and Black Combination)
const orderData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'Incoming Orders',
    data: [120, 150, 200, 250, 300, 350, 400],
    backgroundColor: '#FF0000', // Red fill
    borderColor: '#000000', // Black outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#000000', // Black points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }, {
    label: 'Outgoing Orders',
    data: [50, 70, 100, 120, 150, 180, 200],
    backgroundColor: '#000000', // Black fill
    borderColor: '#FF0000', // Red outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#FF0000', // Red points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }]
};

const revenueData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'Revenue',
    data: [1000, 2000, 2500, 3000, 3500, 4000, 4500],
    backgroundColor: '#FF0000', // Red fill
    borderColor: '#000000', // Black outline
    borderWidth: 2,
    fill: true,
    pointBackgroundColor: '#000000', // Black points
    pointBorderColor: '#FFFFFF', // White point border
    pointRadius: 5
  }]
};

const categoryData = {
  labels: ['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Home'],
  datasets: [{
    label: 'Products Sold',
    data: [300, 450, 100, 150, 200],
    backgroundColor: ['#FF0000', '#000000', '#FF0000', '#000000', '#FF0000'], // Alternating red and black
    borderColor: ['#000000', '#FF0000', '#000000', '#FF0000', '#000000'], // Alternating black and red outlines
    borderWidth: 2,
    barThickness: 20 // Adjust bar width for better visibility
  }]
};

const growthData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [{
    label: 'Customer Growth',
    data: [100, 200, 300, 400, 500, 600, 700],
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
    legend: { position: 'top', display: true, labels: { color: '#6B7280' } }, // Gray (#6B7280, matches var(--color-gray-500))
    title: { display: true, text: '', color: '#FF0000' }, // Red title (handled by HTML h2)
    tooltip: {
      callbacks: { 
        label: function (context) { 
          return context.dataset.label + ': ' + context.raw + (context.dataset.label.includes('Revenue') ? '$' : ' Items'); 
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
