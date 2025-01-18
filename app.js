// Import necessary modules
const express = require('express');
const path = require('path');

// Create an instance of the express app
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set views folder path for EJS templates
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.) from the public folder
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render("index", { title: "Tailwind with Nodemon" });
  });
  
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });