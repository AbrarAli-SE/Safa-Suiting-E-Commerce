const Product = require("../models/Product");
const { uploadCarousel, uploadProduct } = require("../config/multer-config");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer"); // ✅ Import multer to use MulterError

exports.addProduct = async (req, res) => {
  uploadProduct(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.render("product/product-details", { errorMessage: err.message, successMessage: null });
      } else if (err) {
        return res.render("product/product-details", { errorMessage: err.message, successMessage: null });
      }

      const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

      if (!req.file) {
        return res.render("product/product-details", { errorMessage: "Product image is required.", successMessage: null });
      }

      // Save Product in MongoDB with the local file path
      const product = new Product({
        name,
        description,
        price,
        discountPrice: discountPrice || 0,
        quantity,
        category,
        brand,
        image: `/uploads/products/${req.file.filename}`, // Save relative path
        keywords: keywords.split(",").map(k => k.trim().toLowerCase()),
      });

      await product.save();

      res.render("product/product-details", { successMessage: "Product added successfully!", errorMessage: null });
    } catch (error) {
      console.error("❌ Add Product Error:", error);
      res.status(500).send("Server error");
    }
  });
};

exports.updateProduct = async (req, res) => {
  uploadProduct(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.redirect(`/admin/product/product-list?page=1&error=${encodeURIComponent(err.message)}`);
      } else if (err) {
        return res.redirect(`/admin/product/product-list?page=1&error=${encodeURIComponent(err.message)}`);
      }

      const { productId } = req.params;
      const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

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

      const product = await Product.findById(productId);

      if (!product) {
        return res.redirect(`/admin/product/product-list?page=1&error=Product not found.`);
      }

      // Handle image update
      if (req.file) {
        // Delete old image if it exists
        if (product.image && fs.existsSync(path.join(__dirname, "../public", product.image))) {
          try {
            await fs.unlink(path.join(__dirname, "../public", product.image));
          } catch (deleteError) {
            console.error("❌ File Delete Error:", deleteError);
          }
        }
        // Assign new image path
        updateData.image = `/uploads/products/${req.file.filename}`;
      } else {
        // Retain existing image if no new one is uploaded
        updateData.image = product.image;
      }

      await Product.findByIdAndUpdate(productId, updateData, { new: true });

      res.redirect(`/admin/product/product-list?page=1&success=Product updated successfully`);
    } catch (error) {
      console.error("❌ Update Product Error:", error);
      res.redirect(`/admin/product/product-list?page=1&error=Server error. Please try again.`);
    }
  });
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId, page } = req.body;

    if (!productId) {
      return res.redirect(`/admin/product/product-list?page=${page || 1}&error=Invalid product ID.`);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect(`/admin/product/product-list?page=${page || 1}&error=Product not found.`);
    }

    // Delete local image file if it exists
    if (product.image && fs.existsSync(path.join(__dirname, "../public", product.image))) {
      try {
        await fs.unlink(path.join(__dirname, "../public", product.image));
      } catch (deleteError) {
        console.error("❌ File Delete Error:", deleteError);
      }
    }

    // Delete Product from Database
    await Product.findByIdAndDelete(productId);

    // Fetch Updated Product List
    let limit = 5; // Number of products per page
    let skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);

    res.render("product/product-list", {
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      successMessage: "Product deleted successfully!",
      errorMessage: null,
    });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    res.render("product/product-list", {
      products: [],
      currentPage: req.body.page || 1,
      totalPages: 1,
      successMessage: null,
      errorMessage: "Server error. Please try again.",
    });
  }
};

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
// exports.addProduct = async (req, res) => {
//     try {
//         const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

//         if (!req.file) {
//             return res.render("product/product-details", { errorMessage: "Product image is required.", successMessage: null });
//         }

//         // ✅ Upload Image to Cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });

//         // ✅ Save Product in MongoDB
//         const product = new Product({
//             name,
//             description,
//             price,
//             discountPrice: discountPrice || 0,
//             quantity,
//             category,
//             brand,
//             image: result.secure_url, // ✅ Save Cloudinary Image URL
//             keywords: keywords.split(",").map(k => k.trim().toLowerCase()),
//         });

//         await product.save();

//         res.render("product/product-details", { successMessage: "Product added successfully!", errorMessage: null });

//     } catch (error) {
//         console.error("❌ Add Product Error:", error);
//         res.status(500).send("Server error");
//     }
// };

// ✅ Render Product List with Pagination (No Search)
exports.renderProductList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 7; // ✅ Number of products per page
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

exports.renderEditProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).render('error-page', { message: "Product Not Found." }); // Render an error page or send a more informative response
        }

        res.render("product/edit-product", { product });
    } catch (error) {
        console.error("❌ Render Edit Product Error:", error);
        res.status(500).render('error-page', { message: "Server error" }); // Render an error page or send a more informative response
    }
};


// exports.updateProduct = async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { name, description, price, discountPrice, quantity, category, brand, keywords } = req.body;

//         let updateData = {
//             name,
//             description,
//             price,
//             discountPrice: discountPrice || 0,
//             quantity,
//             category,
//             brand,
//             keywords: keywords.split(",").map(k => k.trim().toLowerCase())
//         };

//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.redirect(`/admin/product/product-list?page=1&error=Product not found.`);
//         }

//         // ✅ Only process if the product has an image
//         if (product.image && product.image.includes("cloudinary.com")) {
//             try {
//                 const imagePublicId = product.image.split("/").pop().split(".")[0];

//                 // ✅ Delete old image if a new one is uploaded
//                 if (req.file) {
//                     await cloudinary.uploader.destroy(imagePublicId);
//                     updateData.image = req.file.path; // ✅ Assign new image URL from Cloudinary
//                 }
//             } catch (cloudinaryError) {
//                 console.error("❌ Cloudinary Delete Error:", cloudinaryError);
//             }
//         } else {
//             // ✅ If no new image is uploaded, keep the existing one
//             if (req.file) {
//                 updateData.image = req.file.path;
//             } else {
//                 updateData.image = product.image; // Retain existing image
//             }
//         }

//         await Product.findByIdAndUpdate(productId, updateData, { new: true });

//         res.redirect(`/admin/product/product-list?page=1&success=Product updated successfully`);

//     } catch (error) {
//         console.error("❌ Update Product Error:", error);
//         res.redirect(`/admin/product/product-list?page=1&error=Server error. Please try again.`);
//     }
// };


// exports.deleteProduct = async (req, res) => {
//     try {
//         const { productId, page } = req.body;

//         if (!productId) {
//             return res.redirect(`/admin/product/product-list?page=${page || 1}&error=Invalid product ID.`);
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.redirect(`/admin/product/product-list?page=${page || 1}&error=Product not found.`);
//         }

//         // ✅ Ensure Image Deletion is Safe
//         if (product.image && product.image.includes("cloudinary.com")) {
//             try {
//                 const imagePublicId = product.image.split("/").pop().split(".")[0]; // Extract public ID
//                 await cloudinary.uploader.destroy(imagePublicId);
//             } catch (cloudinaryError) {
//                 console.error("❌ Cloudinary Delete Error:", cloudinaryError);
//             }
//         }

//         // ✅ Delete Product from Database
//         await Product.findByIdAndDelete(productId);

//         // ✅ Fetch Updated Product List
//         let limit = 5; // Number of products per page
//         let skip = (page - 1) * limit;
//         const totalProducts = await Product.countDocuments();
//         const products = await Product.find().skip(skip).limit(limit);

//         // ✅ Render the same page with success message
//         res.render("product/product-list", {
//             products,
//             currentPage: page,
//             totalPages: Math.ceil(totalProducts / limit),
//             successMessage: "Product deleted successfully!",
//             errorMessage: null,
//         });

//     } catch (error) {
//         console.error("❌ Delete Product Error:", error);
//         res.render("product/product-list", {
//             products: [],
//             currentPage: req.body.page || 1,
//             totalPages: 1,
//             successMessage: null,
//             errorMessage: "Server error. Please try again.",
//         });
//     }
// };

