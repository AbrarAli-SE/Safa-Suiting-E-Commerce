// Common Chart Options with Gray Axes and Labels
const commonOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top', display: true, labels: { color: '#6B7280' } }, // Gray (#6B7280)
    title: { display: true, text: '', color: '#FF0000' }, // Red title (handled by HTML h2)
    tooltip: {
      callbacks: { 
        label: function (context) {
          let value = context.raw;
          let formattedValue = Math.round(value).toLocaleString('en-PK');
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

links.forEach(link => {
  if (link.getAttribute("href") === window.location.pathname) {
    link.classList.add("bg-[var(--color-red-500)]", "text-[var(--color-white)]");
  } else {
    link.classList.remove("bg-[var(--color-red-500)]", "text-[var(--color-white)]");
  }
});