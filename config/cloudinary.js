const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // ✅ Ensures HTTPS connections
});

// ✅ Multer Storage with Security Features
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "carousel",
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

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ 5MB limit per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG and PNG are allowed."));
    }
  },
});

module.exports = { cloudinary, upload };
