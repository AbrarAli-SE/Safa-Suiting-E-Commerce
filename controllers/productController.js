const Product = require("../models/Product");
const { uploadCarousel, uploadProduct } = require("../config/multer-config");
const fs = require("fs").promises; // ✅ Correctly import fs.promises
const path = require("path");
const multer = require("multer");

exports.addProduct = async (req, res) => {
  uploadProduct(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { name, description, price, discountPrice, quantity, category, brand, keywords ,newCategory } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Product image is required." });
      }

      // Determine the final category to use
      let finalCategory = category;
      if (newCategory && newCategory.trim() !== "") {
        finalCategory = newCategory.trim(); // Use newCategory if provided
      }

      if (!finalCategory) {
        return res.status(400).json({ error: "Category is required." });
      }
      // Create product object
      const product = new Product({
        name,
        description,
        price,
        discountPrice: discountPrice || 0,
        quantity,
        category: finalCategory,
        brand,
        image: `/uploads/products/${req.file.filename}`,
        keywords: keywords.split(",").map(k => k.trim().toLowerCase()),
      });

      // Save product to MongoDB
      await product.save();

      res.status(200).json({ message: "Product added successfully!" });
    } catch (error) {
      console.error("❌ Add Product Error:", error);
      // If an error occurs after file upload, delete the uploaded file
      if (req.file) {
        try {
          await fs.unlink(path.join(__dirname, "../public/uploads/products", req.file.filename));
        } catch (deleteError) {
          console.error("❌ File Delete Error:", deleteError);
        }
      }
      res.status(500).json({ error: "Server error. Please try again." });
    }
  });
};



// Render Add Product Page Controller
exports.renderAddProduct = async (req, res) => {
  try {
    // Fetch distinct categories from the Product collection
    const categories = await Product.distinct("category");

    // Default categories to always include
    const defaultCategories = [
      "Flash Sales",
      "New Arrival",
      "Explore our Products",
      "Best Selling Products",
    ];

    // Combine default categories with custom ones, avoiding duplicates
    const allCategories = [...new Set([...defaultCategories, ...categories])];

    res.render("product/product-details", { 
      errorMessage: null, 
      successMessage: null,
      categories: allCategories // Pass combined categories to the template
    });
  } catch (error) {
    console.error("❌ Render Add Product Error:", error);
    // Fallback to default categories if there's an error
    res.render("product/product-details", { 
      errorMessage: "Error loading categories",
      successMessage: null,
      categories: [
        "Flash Sales",
        "New Arrival",
        "Explore our Products",
        "Best Selling Products",
      ]
    });
  }
};
// Other exports (updateProduct, deleteProduct) remain unchanged for now





exports.updateProduct = async (req, res) => {
  uploadProduct(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { productId } = req.params;
      const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }

      let updateData = {
        name,
        description,
        price,
        discountPrice: discountPrice || 0,
        quantity,
        category,
        brand,
        keywords: keywords.split(",").map(k => k.trim().toLowerCase()),
      };

      // Handle image update
      if (req.file) {
        if (product.image) {
          const oldImagePath = path.join(__dirname, "../public", product.image);
          try {
            await fs.access(oldImagePath); // Check if file exists
            await fs.unlink(oldImagePath); // Delete it
          } catch (accessError) {
            if (accessError.code !== "ENOENT") { // Ignore if file doesn't exist
              console.error("❌ File Access Error:", accessError);
            }
          }
        }
        updateData.image = `/uploads/products/${req.file.filename}`;
      } else {
        updateData.image = product.image;
      }

      await Product.findByIdAndUpdate(productId, updateData, { new: true });

      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("❌ Update Product Error:", error);
      // Clean up uploaded file if error occurs
      if (req.file) {
        const newImagePath = path.join(__dirname, "../public/uploads/products", req.file.filename);
        try {
          await fs.access(newImagePath); // Check if file exists
          await fs.unlink(newImagePath); // Delete it
        } catch (deleteError) {
          console.error("❌ File Delete Error:", deleteError);
        }
      }
      res.status(500).json({ error: "Server error. Please try again." });
    }
  });
};

// Other exports (e.g., renderEditProduct) remain unchanged

exports.renderEditProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).render('error-page', { message: "Product Not Found." });
    }
    // Fetch distinct categories from the Product collection
    const categories = await Product.distinct("category");

    // Default categories to always include
    const defaultCategories = [
      "Flash Sales",
      "New Arrival",
      "Explore our Products",
      "Best Selling Products",
    ];
     // Combine default categories with custom ones, avoiding duplicates
     const allCategories = [...new Set([...defaultCategories, ...categories])];


    res.render("product/edit-product", { product, errorMessage: null, successMessage: null, categories: allCategories // Pass combined categories to the template
      
     });
  } catch (error) {
    console.error("❌ Render Edit Product Error:", error);
    res.status(500).render('error-page', { message: "Server error" ,
      categories: [
        "Flash Sales",
        "New Arrival",
        "Explore our Products",
        "Best Selling Products",
      ]
    });
  }
};

// Other exports (e.g., addProduct, deleteProduct) omitted for brevity



exports.deleteProduct = async (req, res) => {
  try {
    const { productId, page } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Invalid product ID." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Delete local image file if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, "../public", product.image);
      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
      } catch (deleteError) {
        if (deleteError.code !== "ENOENT") {
          console.error("❌ File Delete Error:", deleteError);
        }
      }
    }

    // Delete Product from Database
    await Product.findByIdAndDelete(productId);

    // Fetch Updated Product List
    const limit = 7; // Match renderProductList limit
    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      message: "Product deleted successfully!",
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    res.status(500).json({ error: "Server error. Please try again." });
  }
};




exports.renderProductList = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const limit = 7; // Number of products per page
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 }) // ✅ Sort by createdAt descending (newest first)
      .skip(skip)
      .limit(limit);

    // Check if it's an AJAX request
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(200).json({
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
      });
    } else {
      // Initial render as EJS
      res.render("product/product-list", {
        products: [], // Empty initially, populated via AJAX
        currentPage: 1,
        totalPages: 1,
        errorMessage: req.query.error || null,
        successMessage: req.query.success || null,
      });
    }
  } catch (error) {
    console.error("❌ Render Product List Error:", error);
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({ error: "Server error" });
    } else {
      res.status(500).send("Server error");
    }
  }
};

// Remove getProducts if not used elsewhere, as renderProductList handles AJAX now
// exports.getProducts = ... (commented out or removed)

// Other exports (e.g., deleteProduct) remain unchanged

// Other exports (e.g., deleteProduct) remain unchanged
// Other exports (e.g., updateProduct, renderEditProduct) omitted for brevity