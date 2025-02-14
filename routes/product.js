const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // ✅ Fix Typo
const { verifyToken, adminAuth } = require("../middleware/authMiddleware");
const { uploadProduct } = require("../config/cloudinary");
const Product = require('../models/Product');

// ✅ Ensure Callback Functions Exist
router.get("/add-product", verifyToken, adminAuth, productController.renderAddProduct);

router.post("/product/add", verifyToken, adminAuth, uploadProduct, productController.addProduct);

// ✅ Route to Render Edit Product Page
router.get("/edit/:productId", verifyToken, adminAuth, productController.renderEditProduct);

// ✅ Route to Update an Existing Product (With Image Upload)
router.post("/update/:productId", verifyToken, adminAuth,uploadProduct,productController.updateProduct);


// ✅ Render Product List (Pagination & Search)
router.get("/product-list", verifyToken, adminAuth, productController.renderProductList);

// ✅ Delete Product
router.post("/delete-product", verifyToken, adminAuth, productController.deleteProduct);




router.get("/search", async (req, res) => {
    try {
      const searchQuery = req.query.q || "";
      if (!searchQuery) return res.json([]); // Return empty if no query
      const regex = new RegExp(searchQuery, "i"); // Case insensitive search
  
      const results = await Product.find({
        $or: [
          { name: { $regex: regex } },
          { description: { $regex: regex } },
          { keywords: { $regex: regex } }
        ]
      }).limit(12);
  
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).send("Error processing search request");
    }
  });
  


module.exports = router;