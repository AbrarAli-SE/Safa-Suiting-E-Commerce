const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // ✅ Fix Typo
const { verifyToken, adminAuth } = require("../middleware/authMiddleware");
const { uploadProduct } = require("../config/cloudinary");

// ✅ Ensure Callback Functions Exist
router.get("/add-product", verifyToken, adminAuth, productController.renderAddProduct);

router.post("/product/add", verifyToken, adminAuth, uploadProduct, productController.addProduct);


// ✅ Render Product List (Pagination & Search)
router.get("/product-list", verifyToken, adminAuth, productController.renderProductList);

// ✅ Delete Product
router.post("/delete-product", verifyToken, adminAuth, productController.deleteProduct);

module.exports = router;
