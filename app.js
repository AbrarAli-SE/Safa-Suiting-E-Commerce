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
  res.render("admin/intro");
});

app.get('/create.html', (req, res, next) => {
  res.render("create");
}); 

app.get('/login.html', (req, res, next) => {
  res.render("login");
}); 

app.get('/forgot.html', (req, res, next) => {
  res.render("forgot");
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

app.get('/profile.html', (req, res, next) => {
  res.render("admin/setting");
});

app.get('/logout', (req, res, next) => {
  res.render("admin/intro");
});
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});