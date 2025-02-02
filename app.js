require('dotenv').config();
// Import necessary modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const createHttpErrors = require('http-errors');

// Create an instance of the express app
const app = express();

app.use(morgan('dev'));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set views folder path for EJS templates
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
  res.render("index");
});


// 404 error handling
app.use((req, res, next) => {
  next(createHttpErrors.NotFound());
});

// Error Handling Middleware
app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render('404-Error', { error });
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});