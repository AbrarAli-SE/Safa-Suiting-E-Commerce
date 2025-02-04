  require('dotenv').config();
  const express = require('express');
  const cookieParser = require("cookie-parser");
  const morgan = require('morgan');
  const createHttpErrors = require('http-errors');
  const dbConfig = require('./config/dbConfig');
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/user');
  const verifyToken = require("./middleware/authMiddleware");
  const path = require('path');

  const app = express();
  app.use(express.json());
  app.use(cookieParser());  // ✅ Enable Cookie Parser

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


// ✅ Public Index Page
app.get("/", (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.render("index");
    return res.redirect("/dashboard");
});

// ✅ Protected Dashboard Route
app.get("/dashboard", verifyToken, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/admin", verifyToken, (req, res) => {
  res.render("admin/intro");
});



  // Routes
  // app.use('/api', authRoutes);
  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);


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