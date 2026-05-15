const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
 
const upload = multer({
  storage: storage
});

// Upload file to Cloudinary
const uploadToCloudinary = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!cloudinary.config().cloud_name) {
      return reject(new Error('Cloudinary is not configured. Missing environment variables.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'holly-zolly', // Creates a folder in Cloudinary
        public_id: fileName || `product-${Date.now()}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error details:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Handle stream errors
    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.end(fileBuffer);
  });
};

module.exports = { upload, uploadToCloudinary };
