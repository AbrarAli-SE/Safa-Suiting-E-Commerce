const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // ✅ Fix Typo
const { verifyToken, adminAuth } = require("../middleware/authMiddleware");
const { uploadProduct } = require("../config/cloudinary");

// ✅ Ensure Callback Functions Exist
router.get("/add-product", verifyToken, adminAuth, productController.renderAddProduct);

router.post("/product/add", verifyToken, adminAuth, uploadProduct, productController.addProduct);

// ✅ Route to Render Edit Product Page
router.get("/edit/:productId", verifyToken, adminAuth, productController.renderEditProduct);

// ✅ Route to Update an Existing Product (With Image Upload)
router.post("/update/:productId", verifyToken, adminAuth, productController.updateProduct);


// ✅ Render Product List (Pagination & Search)
router.get("/product-list", verifyToken, adminAuth, productController.renderProductList);

// ✅ Delete Product
router.post("/delete-product", verifyToken, adminAuth, productController.deleteProduct);

module.exports = router;
