const Product = require("../models/Product");
const { uploadCarousel, uploadProduct } = require("../config/multer-config");
const fs = require("fs").promises; // Import fs.promises for async file operations
const path = require("path");
const multer = require("multer");

// Add a new product with image upload
exports.addProduct = async (req, res) => {
    uploadProduct(req, res, async (err) => {
        try {
            // Handle Multer-specific errors or other upload errors
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { name, description, price, discountPrice, quantity, category, brand, keywords, newCategory } = req.body;

            // Validate that an image file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: "Product image is required." });
            }

            // Use newCategory if provided and non-empty, otherwise fallback to category
            let finalCategory = category;
            if (newCategory && newCategory.trim() !== "") {
                finalCategory = newCategory.trim();
            }

            // Ensure a category is specified
            if (!finalCategory) {
                return res.status(400).json({ error: "Category is required." });
            }

            // Create a new product object with provided data
            const product = new Product({
                name,
                description,
                price,
                discountPrice: discountPrice || 0, // Default to 0 if not provided
                quantity,
                category: finalCategory,
                brand,
                image: `/uploads/products/${req.file.filename}`, // Store uploaded image path
                keywords: keywords.split(",").map(k => k.trim().toLowerCase()), // Split and normalize keywords
            });

            // Save the product to the database
            await product.save();

            // Respond with success message
            res.status(200).json({ message: "Product added successfully!" });
        } catch (error) {
            // Log error for debugging
            console.error("❌ Add Product Error:", error);
            // Clean up uploaded file if an error occurs after upload
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

// Render the Add Product page with category options
exports.renderAddProduct = async (req, res) => {
    try {
        // Fetch unique categories from existing products
        const categories = await Product.distinct("category");

        // Define default categories to always include
        const defaultCategories = [
            "Flash Sales",
            "New Arrival",
            "Explore our Products",
            "Best Selling Products",
        ];

        // Combine default and custom categories, removing duplicates
        const allCategories = [...new Set([...defaultCategories, ...categories])];

        // Render the Add Product page with category options
        res.render("product/product-details", { 
            errorMessage: null, // Initial state: no error
            successMessage: null, // Initial state: no success
            categories: allCategories // Pass combined categories to the template
        });
    } catch (error) {
        // Log error for debugging
        console.error("❌ Render Add Product Error:", error);
        // Render with default categories as a fallback on error
        res.render("product/product-details", { 
            errorMessage: "Error loading categories", // Inform user of the issue
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

// Update an existing product with optional image upload
exports.updateProduct = async (req, res) => {
    uploadProduct(req, res, async (err) => {
        try {
            // Handle Multer-specific errors or other upload errors
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            } else if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { productId } = req.params;
            const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

            // Fetch the existing product
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: "Product not found." });
            }

            // Prepare update data with new values
            let updateData = {
                name,
                description,
                price,
                discountPrice: discountPrice || 0, // Default to 0 if not provided
                quantity,
                category,
                brand,
                keywords: keywords.split(",").map(k => k.trim().toLowerCase()), // Split and normalize keywords
            };

            // Handle image update if a new file is uploaded
            if (req.file) {
                if (product.image) {
                    const oldImagePath = path.join(__dirname, "../public", product.image);
                    try {
                        await fs.access(oldImagePath); // Verify old image exists
                        await fs.unlink(oldImagePath); // Delete old image
                    } catch (accessError) {
                        if (accessError.code !== "ENOENT") { // Ignore if file doesn't exist
                            console.error("❌ File Access Error:", accessError);
                        }
                    }
                }
                updateData.image = `/uploads/products/${req.file.filename}`; // Set new image path
            } else {
                updateData.image = product.image; // Retain existing image if no new upload
            }

            // Update the product in the database
            await Product.findByIdAndUpdate(productId, updateData, { new: true });

            // Respond with success message
            res.status(200).json({ message: "Product updated successfully" });
        } catch (error) {
            // Log error for debugging
            console.error("❌ Update Product Error:", error);
            // Clean up uploaded file if an error occurs after upload
            if (req.file) {
                const newImagePath = path.join(__dirname, "../public/uploads/products", req.file.filename);
                try {
                    await fs.access(newImagePath); // Verify file exists
                    await fs.unlink(newImagePath); // Delete it
                } catch (deleteError) {
                    console.error("❌ File Delete Error:", deleteError);
                }
            }
            res.status(500).json({ error: "Server error. Please try again." });
        }
    });
};

// Render the Edit Product page with product details and categories
exports.renderEditProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Fetch the product to edit
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render('error-page', { message: "Product Not Found." });
        }

        // Fetch unique categories from existing products
        const categories = await Product.distinct("category");

        // Define default categories to always include
        const defaultCategories = [
            "Flash Sales",
            "New Arrival",
            "Explore our Products",
            "Best Selling Products",
        ];

        // Combine default and custom categories, removing duplicates
        const allCategories = [...new Set([...defaultCategories, ...categories])];

        // Render the Edit Product page with product data and categories
        res.render("product/edit-product", { 
            product, 
            errorMessage: null, // Initial state: no error
            successMessage: null, // Initial state: no success
            categories: allCategories // Pass combined categories to the template
        });
    } catch (error) {
        // Log error for debugging
        console.error("❌ Render Edit Product Error:", error);
        // Render an error page with default categories as a fallback
        res.status(500).render('error-page', { 
            message: "Server error",
            categories: [
                "Flash Sales",
                "New Arrival",
                "Explore our Products",
                "Best Selling Products",
            ]
        });
    }
};

// Delete a product and its associated image
exports.deleteProduct = async (req, res) => {
    try {
        const { productId, page } = req.body;

        // Validate product ID
        if (!productId) {
            return res.status(400).json({ error: "Invalid product ID." });
        }

        // Fetch the product to delete
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        // Remove the product image from the filesystem if it exists
        if (product.image) {
            const imagePath = path.join(__dirname, "../public", product.image);
            try {
                await fs.access(imagePath); // Check if file exists
                await fs.unlink(imagePath); // Delete the image
            } catch (deleteError) {
                if (deleteError.code !== "ENOENT") { // Ignore if file doesn't exist
                    console.error("❌ File Delete Error:", deleteError);
                }
            }
        }

        // Delete the product from the database
        await Product.findByIdAndDelete(productId);

        // Fetch updated product list for pagination
        const limit = 7; // Match renderProductList limit
        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments();
        const products = await Product.find().skip(skip).limit(limit);

        // Respond with success message and updated product list
        res.status(200).json({
            message: "Product deleted successfully!",
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (error) {
        // Log error for debugging
        console.error("❌ Delete Product Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
};

// Render the product list with pagination
exports.renderProductList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        const limit = 7; // Number of products per page
        const skip = (page - 1) * limit;

        // Count total products and fetch paginated list
        const totalProducts = await Product.countDocuments();
        const products = await Product.find()
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .skip(skip)
            .limit(limit);

        // Handle AJAX request for dynamic updates
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
            res.status(200).json({
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
            });
        } else {
            // Initial render with empty list, populated via AJAX
            res.render("product/product-list", {
                products: [], // Empty initially for AJAX population
                currentPage: 1,
                totalPages: 1,
                errorMessage: req.query.error || null, // Pass error from query if present
                successMessage: req.query.success || null, // Pass success from query if present
            });
        }
    } catch (error) {
        // Log error for debugging
        console.error("❌ Render Product List Error:", error);
        // Respond based on request type
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
            res.status(500).json({ error: "Server error" });
        } else {
            res.status(500).send("Server error");
        }
    }
};