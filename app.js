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


app.get('/', (req, res, next) => {
  res.render("index");
});

app.get('/contact.html', (req, res, next) => {
  res.render("contact");
});

app.get('/about.html', (req, res, next) => {
  res.render("about");
});

app.get('/account.html', (req, res, next) => {
  res.render("account");
});

app.get('/wishlist.html', (req, res, next) => {
  res.render("wishlist");
});

app.get('/my-orders', (req, res, next) => {
  res.render("orders/order-summary");
});

app.get('/my-cancellations', (req, res, next) => {
  res.render("orders/order-cancel");
});

app.get('/my-cart', (req, res, next) => {
  res.render("cart/cart");
});

app.get('/checkout', (req, res, next) => {
  res.render("cart/checkout");
});

app.get('/create.html', (req, res, next) => {
  res.render("auth/register");
}); 

app.get('/login.html', (req, res, next) => {
  res.render("auth/login");
}); 

app.get('/forgot.html', (req, res, next) => {
  res.render("auth/forgot-password");
});

app.get('/analytical.html', (req, res, next) => {
  res.render("admin/analytical");
});

app.get('/manage.html', (req, res, next) => {
  res.render("product/product-details");
});
app.get('/Productlist.html', (req, res, next) => {
  res.render("product/product-list");
});

app.get('/coursel.html', (req, res, next) => {
  res.render("admin/coursel");
});

app.get('/coupon.html', (req, res, next) => {
  res.render("admin/CouponCode");
});

app.get('/track.html', (req, res, next) => {
  res.render("admin/trackId");
});


app.get('/payment.html', (req, res, next) => {
  res.render("admin/payment");
});

app.get('/cancelorder.html', (req, res, next) => {
  res.render("orders/order-history");
});

app.get('/manageuser.html', (req, res, next) => {
  res.render("admin/user-management");
});

app.get('/user-details.html', (req, res, next) => {
  res.render("admin/user-detail");
});

app.get('/profile.html', (req, res, next) => {
  res.render("admin/setting");
});

app.get('/logout', (req, res, next) => {
  res.render("admin/intro");
});

app.get('/error', (req, res, next) => {
  res.render("404-Error");
});
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});