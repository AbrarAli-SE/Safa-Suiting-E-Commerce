  require('dotenv').config();
  const express = require('express');
  const session = require("express-session");
  const cookieParser = require("cookie-parser");
  const passport = require("./config/passport"); // ✅ Import configured passport
  const morgan = require('morgan');
  const createHttpErrors = require('http-errors');
  const dbConfig = require('./config/dbConfig');
  const userRoutes = require('./routes/user');
  const indexRoutes = require('./routes/index');
  const adminRoutes = require('./routes/admin');
  const pageRoutes = require("./routes/page");
  const wishlistRoutes = require("./routes/wishlist"); // ✅ Import Wishlist Routes
  const cartRoutes = require("./routes/cart"); // ✅ Import Cart Routes
  const productRoutes = require("./routes/product"); // ✅ Import Cart Routes
  const orderRoutes = require("./routes/orders"); // ✅ Import Cart Routes
  const {verifyToken} = require("./middleware/authMiddleware");
  
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

  app.use(verifyToken); // ✅ Set `req.user` for all requests

  // ✅ Make `req.user` available globally in views
  app.use((req, res, next) => {
      res.locals.user = req.user || null;
      next();
  });



// app.use('/adminusers',(req,res) => {
//   res.render('admin/setting');
// })



// Routes
app.use('/', indexRoutes)
app.use("/auth", authRoutes); // ✅ Ensure "/auth" prefix is correctly set
app.use('/user', userRoutes);
app.use("/api", productRoutes); // Prefix API routes with '/api'
app.use("/user/wishlist", wishlistRoutes); // ✅ Wishlist Routes
app.use("/user/cart", cartRoutes); // ✅ Cart Routes
app.use("/user/order", orderRoutes); // ✅ Cart Routes
// ✅ Ensures `/pages/contact` and `/pages/about` are accessible for all users
app.use("/pages", pageRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/product', productRoutes);
// ✅ Routes


// app.get("/admin", verifyToken, (req, res) => {
//   res.render("admin/intro");
// });

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