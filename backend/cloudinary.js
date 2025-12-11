const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload PDF to Cloudinary
const uploadPDF = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw', // Use 'raw' for PDF files
      folder: options.folder || 'notices', // Optional folder in Cloudinary
      public_id: options.public_id, // Optional custom public_id
      ...options
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload error: ${error.message}`);
  }
};

// Function to upload PDF from buffer (useful with multer memory storage)
const uploadPDFFromBuffer = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // Use 'raw' for PDF files
        folder: options.folder || 'notices',
        public_id: options.public_id,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload error: ${error.message}`));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Function to delete PDF from Cloudinary
const deletePDF = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete error: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadPDF,
  uploadPDFFromBuffer,
  deletePDF
};

