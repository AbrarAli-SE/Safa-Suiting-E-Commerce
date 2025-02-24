const multer = require("multer");
const path = require("path");

const carouselStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads/carousel/";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `carousel-${uniqueSuffix}${ext}`);
  },
});

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

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(`File Rejected: ${file.originalname} - Invalid type: ${file.mimetype}`);
    cb(new Error(`Invalid file type for ${file.originalname}. Only JPG, JPEG, and PNG allowed.`), false);
  }
};

const uploadCarousel = multer({
  storage: carouselStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
}).array("images");

const uploadProduct = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

module.exports = { uploadCarousel, uploadProduct };