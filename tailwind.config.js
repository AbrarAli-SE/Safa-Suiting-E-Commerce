module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'smd': '685px',
        'md': '768px',
        'tablet': '912px',
        'lg': '1024px',
        'xlg': '1050px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        black: 'var(--color-black)',
        white: 'var(--color-white)',
        'red-50': 'var(--color-red-50)',  // Added for bg-red-50
        'red-500': 'var(--color-red-500)',
        'red-700': 'var(--color-red-700)',
        'gray-50': 'var(--color-gray-50)',
        'gray-300': 'var(--color-gray-300)', // Added for border-gray-300
        'gray-400': 'var(--color-gray-400)',
        'gray-500': 'var(--color-gray-500)',
        'gray-600': 'var(--color-gray-600)',
        'gray-900': 'var(--color-gray-900)',
      },
      spacing: {
        'root-1': 'var(--spacing-1)',
        'root-2': 'var(--spacing-2)',
        'root-3': 'var(--spacing-3)',
        'root-4': 'var(--spacing-4)',
        'root-5': 'var(--spacing-5)',
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [
    require('tailwind-scrollbar'),
    require('tailwindcss-animate'), // Already included, ensures animations work
    function ({ addBase, addUtilities }) {
      addBase({
        ':root': {
          '--spacing-1': '0.25rem',
          '--spacing-2': '0.5rem',
          '--spacing-3': '0.75rem',
          '--spacing-4': '1rem',
          '--spacing-5': '1.25rem',
          '--color-black': '#000000',
          '--color-white': '#ffffff',
          '--color-red-50': '#fef2f2',  // Added for bg-red-50
          '--color-red-500': '#ff0000',
          '--color-red-700': '#cc0000',
          '--color-gray-50': '#f9fafb',
          '--color-gray-300': '#d1d5db', // Added for border-gray-300
          '--color-gray-400': '#9ca3af',
          '--color-gray-500': '#6b7280',
          '--color-gray-600': '#4b5563',
          '--color-gray-900': '#111827',
          '--color-green-500': '#22c55e',
        },
      });

      const shortcuts = {
        '.p-root-1': { padding: 'var(--spacing-1)' },
        '.p-root-2': { padding: 'var(--spacing-2)' },
        '.p-root-3': { padding: 'var(--spacing-3)' },
        '.p-root-4': { padding: 'var(--spacing-4)' },
        '.p-root-5': { padding: 'var(--spacing-5)' },
        '.m-root-1': { margin: 'var(--spacing-1)' },
        '.m-root-2': { margin: 'var(--spacing-2)' },
        '.m-root-3': { margin: 'var(--spacing-3)' },
        '.m-root-4': { margin: 'var(--spacing-4)' },
        '.m-root-5': { margin: 'var(--spacing-5)' },
        '.bg-black-root': { backgroundColor: 'var(--color-black)' },
        '.bg-white-root': { backgroundColor: 'var(--color-white)' },
        '.bg-red-500-root': { backgroundColor: 'var(--color-red-500)' },
        '.text-black-root': { color: 'var(--color-black)' },
        '.text-white-root': { color: 'var(--color-white)' },
        '.text-red-500-root': { color: 'var(--color-red-500)' },
        '.btn-red': {
          backgroundColor: 'var(--color-red-500)',
          color: 'var(--color-white)',
          padding: 'var(--spacing-2) var(--spacing-4)',
          borderRadius: '0.5rem',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: 'var(--color-red-700)',
          },
        },
        '.card-shadow': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s ease, transform 0.5s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      };

      addUtilities(shortcuts, ['responsive', 'hover']);
    },
  ],
};