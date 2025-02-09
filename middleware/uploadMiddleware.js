const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ✅ Set Up Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "carousel-images", // ✅ Store images in a Cloudinary folder
        allowed_formats: ["jpg", "jpeg", "png"],
    },
});

const upload = multer({ storage });

module.exports = upload;
