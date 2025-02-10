const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // ✅ Ensures HTTPS connections
});

// ✅ Multer Storage for Carousel (Only for 3 Images)
const carouselStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "carousel", // ✅ Uploads to "carousel" folder
      format: file.mimetype.split("/")[1], // ✅ Ensures correct format
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"], // ✅ Allow only specific formats
      transformation: [
        { width: 1920, height: 1080, crop: "limit" }, // ✅ Resize images
        { quality: "auto" }, // ✅ Optimize image quality
        { fetch_format: "auto" }, // ✅ Auto format for better compression
      ],
    };
  },
});

// ✅ Multer Storage for Products (Only 1 Image per Product)
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "products", // ✅ Uploads to "products" folder
      format: file.mimetype.split("/")[1], // ✅ Ensures correct format
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png"], // ✅ Allow only specific formats
      transformation: [
        { width: 1000, height: 1000, crop: "limit" }, // ✅ Resize to 1000x1000
        { quality: "auto" }, // ✅ Optimize image quality
        { fetch_format: "auto" }, // ✅ Auto format for better compression
      ],
    };
  },
});

// ✅ Multer Upload Middleware (Separate for Each Use Case)
const uploadCarousel = multer({ storage: carouselStorage }).array("images", 3); // ✅ Allows up to 3 images
const uploadProduct = multer({ storage: productStorage }).single("image"); // ✅ Allows only 1 image per product

module.exports = { cloudinary, uploadCarousel, uploadProduct };
