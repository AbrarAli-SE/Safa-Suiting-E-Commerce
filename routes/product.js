const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // ✅ Fix Typo
const { authenticateUser, adminAuth } = require("../middleware/authMiddleware");
const { uploadProduct } = require("../config/cloudinary");
const Product = require('../models/Product');

// ✅ Ensure Callback Functions Exist
router.get("/add-product", authenticateUser, adminAuth, productController.renderAddProduct);

router.post("/product/add", authenticateUser, adminAuth, uploadProduct, productController.addProduct);

// ✅ Route to Render Edit Product Page
router.get("/edit/:productId", authenticateUser, adminAuth, productController.renderEditProduct);

// ✅ Route to Update an Existing Product (With Image Upload)
router.post("/update/:productId", authenticateUser, adminAuth,uploadProduct,productController.updateProduct);


// ✅ Render Product List (Pagination & Search)
router.get("/product-list", authenticateUser, adminAuth, productController.renderProductList);

// ✅ Delete Product
router.post("/delete-product", authenticateUser, adminAuth, productController.deleteProduct);

  


module.exports = router;