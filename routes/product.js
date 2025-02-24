const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticateUser, adminAuth } = require("../middleware/authMiddleware");

router.get("/add-product", authenticateUser, adminAuth, productController.renderAddProduct);
router.post("/product/add", authenticateUser, adminAuth, productController.addProduct);



router.get("/edit/:productId", authenticateUser, adminAuth, productController.renderEditProduct);
router.put("/update/:productId", authenticateUser, adminAuth, productController.updateProduct); // Changed to PUT

router.delete("/delete-product", authenticateUser, adminAuth, productController.deleteProduct); // Changed to DELETE
// In routes/admin.js
router.get("/product-list", authenticateUser, adminAuth, productController.renderProductList);
// router.get("/product-list-data", authenticateUser, adminAuth, productController.getProducts); // New AJAX endpoint

  


module.exports = router;