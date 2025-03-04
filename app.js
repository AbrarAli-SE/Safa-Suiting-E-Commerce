require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require("fs");
  const session = require("express-session");
  const cookieParser = require("cookie-parser");
  const morgan = require('morgan');
  const createHttpErrors = require('http-errors');
  const dbConfig = require('./config/dbConfig');
  const userRoutes = require('./routes/user');
  const indexRoutes = require('./routes/index');
  const uploadRoutes = require("./routes/upload");
  const adminRoutes = require('./routes/admin');
  const pageRoutes = require("./routes/page");
  const searchRouter = require('./routes/search'); // Make sure this path is correct
  const wishlistRoutes = require("./routes/wishlist"); // ✅ Import Wishlist Routes
  const cartRoutes = require("./routes/cart"); // ✅ Import Cart Routes
  const productRoutes = require("./routes/product"); // ✅ Import Cart Routes
  const orderRoutes = require("./routes/orders"); // ✅ Import Cart Routes
  const ContactInfo = require("./models/info"); // Adjust path as needed
  const {authenticateUser} = require("./middleware/authMiddleware");
  

  const app = express();
  app.use(express.json());
  app.use(cookieParser());  // ✅ Enable Cookie Parser

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false
}));


  // Database Connection
  dbConfig();
  
  app.use(morgan('dev'));
  
  
  
  const authRoutes = require('./routes/auth');

  // Set the view engine to EJS
  app.set('view engine', 'ejs');

  // Set views folder path for EJS templates
  app.set('views', path.join(__dirname, 'views'));

  // Serve static files (CSS, images, etc.) from the public folder
  app.use(express.static(path.join(__dirname, 'public')));

//   // Create upload folders if they don’t exist
// ["public/uploads/carousel", "public/uploads/products"].forEach(dir => {
//   fs.mkdirSync(dir, { recursive: true });
// });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(authenticateUser);


  // ✅ Make `req.user` available globally in views
  app.use((req, res, next) => {
      res.locals.user = req.user || null;
      next();
  });



// app.use('/adminusers',(req,res) => {
//   res.render('admin/setting');
// })
// Middleware to fetch contactInfo for all routes
app.use(async (req, res, next) => {
  try {
    const contactInfo = await ContactInfo.findOne({}).lean();
    res.locals.contactInfo = contactInfo || {
      phoneNumber: "Not set",
      supportEmail: "Not set",
      city: "Not set"
    }; // Default values if no document exists
    next();
  } catch (error) {
    console.error("❌ Middleware Error fetching contactInfo:", error);
    res.locals.contactInfo = {
      phoneNumber: "Not set",
      supportEmail: "Not set",
      city: "Not set"
    };
    next();
  }
});


// Routes
app.use('/', indexRoutes);
app.use("/upload", uploadRoutes);
app.use('/search', searchRouter); // Use the search router under the '/search' path
app.use("/auth", authRoutes); // ✅ Ensure "/auth" prefix is correctly set
app.use('/user', userRoutes);
// app.use("/api", productRoutes); // Prefix API routes with '/api'
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