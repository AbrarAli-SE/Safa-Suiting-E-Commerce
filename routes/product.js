const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // ✅ Fix Typo
const { verifyToken, adminAuth } = require("../middleware/authMiddleware");

// ✅ Ensure Callback Functions Exist
router.get("/add-product", verifyToken, adminAuth, productController.renderAddProduct);
router.get("/product-list", verifyToken, adminAuth, productController.renderProductList);

module.exports = router;
