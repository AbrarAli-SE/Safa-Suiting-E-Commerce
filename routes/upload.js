const express = require("express");
const router = express.Router();
const { uploadCarousel, uploadProduct } = require("../config/multer-config"); // Updated path

router.post("/carousel", (req, res) => {
  uploadCarousel(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    const filePaths = req.files.map(file => `/uploads/carousel/${file.filename}`);
    res.json({ message: "Carousel images uploaded", files: filePaths });
  });
});

router.post("/product", (req, res) => {
  uploadProduct(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    const filePath = `/uploads/products/${req.file.filename}`;
    res.json({ message: "Product image uploaded", file: filePath });
  });
});

module.exports = router;