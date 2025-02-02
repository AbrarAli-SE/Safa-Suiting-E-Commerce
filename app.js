require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const createHttpErrors = require('http-errors');
const dbConfig = require('./config/dbConfig');
const transporter = require('./config/emailConfig');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
app.use(express.json());

// Database Connection
dbConfig();

app.use(morgan('dev'));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set views folder path for EJS templates
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Routes
app.use('/api', authRoutes);

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

app.listen(3000, () => console.log('Server running on port 3000'));