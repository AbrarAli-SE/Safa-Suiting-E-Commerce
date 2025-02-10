const Product = require("../models/Product");
const {cloudinary} = require("../config/cloudinary");

// ✅ Render Add Product Page
exports.renderAddProduct = async (req, res) => {
    try {
        res.render("product/product-details", { successMessage: null, errorMessage: null });
    } catch (error) {
        console.error("❌ Render Add Product Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Add New Product (Upload to Cloudinary)
exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

        if (!req.file) {
            return res.render("product/product-details", { errorMessage: "Product image is required.", successMessage: null });
        }

        // ✅ Upload Image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });

        // ✅ Save Product in MongoDB
        const product = new Product({
            name,
            description,
            price,
            discountPrice: discountPrice || 0,
            quantity,
            category,
            brand,
            image: result.secure_url, // ✅ Save Cloudinary Image URL
            keywords: keywords.split(",").map(k => k.trim().toLowerCase()),
        });

        await product.save();

        res.render("product/product-details", { successMessage: "Product added successfully!", errorMessage: null });

    } catch (error) {
        console.error("❌ Add Product Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Render Product List with Pagination (No Search)
exports.renderProductList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 5; // ✅ Number of products per page
        let skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments();
        const products = await Product.find().skip(skip).limit(limit);

        res.render("product/product-list", {
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            errorMessage: null,
            successMessage: null
        });

    } catch (error) {
        console.error("❌ Render Product List Error:", error);
        res.status(500).send("Server error");
    }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return res.redirect("/admin/product/product-list?page=1");
        }

        // ✅ Delete Image from Cloudinary
        const imagePublicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${imagePublicId}`);

        await Product.findByIdAndDelete(productId);
        res.redirect("/admin/product/product-list?page=1");

    } catch (error) {
        console.error("❌ Delete Product Error:", error);
        res.status(500).send("Server error");
    }
};
