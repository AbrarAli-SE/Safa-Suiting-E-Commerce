const multer = require("multer");
const path = require("path");

// Multer Storage for Carousel (Up to 3 Images)
const carouselStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/carousel/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `carousel-${uniqueSuffix}${ext}`);
  },
});

// Multer Storage for Products (1 Image per Product)
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/products/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File Filter to Restrict Formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG files are allowed"), false);
  }
};

// Multer Upload Middleware
const uploadCarousel = multer({
  storage: carouselStorage,
  fileFilter: fileFilter,
  limits: { files: 3, fileSize: 5 * 1024 * 1024 }, // 3 files, 5MB each
}).array("images", 3);

const uploadProduct = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
}).single("image");

module.exports = { uploadCarousel, uploadProduct };