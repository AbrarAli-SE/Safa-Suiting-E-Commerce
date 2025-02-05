  require('dotenv').config();
  const express = require('express');
  const session = require("express-session");
  const cookieParser = require("cookie-parser");
  const passport = require("./config/passport"); // ✅ Import configured passport
  const morgan = require('morgan');
  const createHttpErrors = require('http-errors');
  const dbConfig = require('./config/dbConfig');
  const userRoutes = require('./routes/user');
  const indexRoutes = require('./routes/index')
  const pageRoutes = require("./routes/page");
  const verifyToken = require("./middleware/authMiddleware");
  const path = require('path');

  const app = express();
  app.use(express.json());
  app.use(cookieParser());  // ✅ Enable Cookie Parser

  // ✅ Enable session
  app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false, // ✅ Avoid saving empty sessions
    })
  );
  
  // ✅ Initialize Passport.js
  app.use(passport.initialize());
  app.use(passport.session());

  // Database Connection
  dbConfig();
  
  app.use(morgan('dev'));
  
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  const authRoutes = require('./routes/auth');

  // Set the view engine to EJS
  app.set('view engine', 'ejs');

  // Set views folder path for EJS templates
  app.set('views', path.join(__dirname, 'views'));

  // Serve static files (CSS, images, etc.) from the public folder
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    res.locals.user = req.user || null; // ✅ Set `user` globally for EJS views
    next();
});








// Routes
app.use('/', indexRoutes)
app.use("/auth", authRoutes); // ✅ Ensure "/auth" prefix is correctly set
app.use('/user', userRoutes);
// app.use('/user', adminRoutes);
// ✅ Routes


app.get("/admin", verifyToken, (req, res) => {
  res.render("admin/intro");
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

  app.listen(3000, () => console.log('🚀 Server running on port 3000'));