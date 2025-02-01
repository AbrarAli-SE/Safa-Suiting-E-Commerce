module.exports = {
  content: [
    "./views/**/*.ejs", // Include EJS templates
    "./public/**/*.js", // Include any JS files in the public folder
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      screens: {
        'xlg': '1050px', // Custom breakpoint for 1050px
        'smd': '685px',
      }
    },
  },
  plugins: [require('tailwind-scrollbar')],
  plugins: [require("tailwindcss-animate")],
};




