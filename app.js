require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const fs = require("fs");
const session = require("express-session"); // Manage user sessions
const cookieParser = require("cookie-parser"); // Parse cookies from requests
const morgan = require('morgan'); // HTTP request logger
const createHttpErrors = require('http-errors'); // Create HTTP error objects
const dbConfig = require('./config/dbConfig'); // Database configuration
const userRoutes = require('./routes/user'); // User-related routes
const indexRoutes = require('./routes/index'); // Home/index routes
const uploadRoutes = require("./routes/upload"); // File upload routes
const adminRoutes = require('./routes/admin'); // Admin-specific routes
const pageRoutes = require("./routes/page"); // Static page routes (e.g., about, contact)
const searchRouter = require('./routes/search'); // Search functionality routes
const wishlistRoutes = require("./routes/wishlist"); // Wishlist management routes
const cartRoutes = require("./routes/cart"); // Shopping cart routes
const productRoutes = require("./routes/product"); // Product management routes
const orderRoutes = require("./routes/orders"); // Order-related routes
const ContactInfo = require("./models/info"); // Contact information model
const { authenticateUser } = require("./middleware/authMiddleware"); // Authentication middleware

// Initialize Express application
const app = express();

// Enable JSON parsing for request bodies
app.use(express.json());

// Enable cookie parsing for session management and authentication
app.use(cookieParser());

// Configure session middleware with a secret key
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret', // Use env variable or fallback
    resave: false, // Don't save session if unmodified
    saveUninitialized: false // Don't create session until something is stored
}));

// Connect to the database
dbConfig();

// Log HTTP requests in development mode for debugging
app.use(morgan('dev'));

// Import authentication routes
const authRoutes = require('./routes/auth');

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Define the directory for EJS templates
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., CSS, JS, images) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable URL-encoded form data parsing (e.g., for form submissions)
app.use(express.urlencoded({ extended: false }));

// Re-enable JSON parsing (already set, but ensures clarity)
app.use(express.json());

// Apply authentication middleware to verify user tokens
app.use(authenticateUser);

// Make authenticated user data available globally in all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Pass user object or null if not authenticated
    next();
});

// Middleware to fetch contact information for all routes
app.use(async (req, res, next) => {
    try {
        // Fetch contact info from the database
        const contactInfo = await ContactInfo.findOne({}).lean();
        // Set contact info in res.locals with defaults if none exists
        res.locals.contactInfo = contactInfo || {
            phoneNumber: "Not set",
            supportEmail: "Not set",
            city: "Not set"
        };
        next();
    } catch (error) {
        // Log error and set default contact info on failure
        console.error("❌ Middleware Error fetching contactInfo:", error);
        res.locals.contactInfo = {
            phoneNumber: "Not set",
            supportEmail: "Not set",
            city: "Not set"
        };
        next();
    }
});

// Define application routes
app.use('/', indexRoutes); // Home page and root routes
app.use("/upload", uploadRoutes); // File upload endpoints
app.use('/search', searchRouter); // Search functionality under /search
app.use("/auth", authRoutes); // Authentication routes (login, logout, etc.)
app.use('/user', userRoutes); // User-specific routes
app.use("/user/wishlist", wishlistRoutes); // Wishlist routes under /user/wishlist
app.use("/user/cart", cartRoutes); // Cart routes under /user/cart
app.use("/user/orders", orderRoutes); // Order routes under /user/orders
app.use("/pages", pageRoutes); // Static pages (e.g., /pages/contact, /pages/about)
app.use('/admin', adminRoutes); // Admin dashboard and management routes
app.use('/admin/product', productRoutes); // Product management under /admin/product

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
    next(createHttpErrors.NotFound()); // Trigger a 404 error
});

// Centralized error handling middleware
app.use((error, req, res, next) => {
    error.status = error.status || 500; // Default to 500 if no status is set
    res.status(error.status);
    // Render the 404-Error page with error details
    res.render('404-Error', { error });
});

// Start the server on port 3000
app.listen(3000, () => console.log('🚀 Server running on port 3000'));