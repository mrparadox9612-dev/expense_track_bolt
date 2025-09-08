const cloudinary = require('cloudinary').v2;

// TODO: FILE - Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'expense-tracker',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    // Extract public ID from URL if full URL is provided
    let id = publicId;
    if (publicId.includes('cloudinary.com')) {
      const urlParts = publicId.split('/');
      const filename = urlParts[urlParts.length - 1];
      id = filename.split('.')[0]; // Remove file extension
      
      // Include folder path if present
      const folderIndex = urlParts.indexOf('expense-tracker');
      if (folderIndex !== -1) {
        id = urlParts.slice(folderIndex).join('/').split('.')[0];
      }
    }

    const result = await cloudinary.uploader.destroy(id);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  };

  return cloudinary.url(publicId, defaultOptions);
};

// Generate signed upload URL for direct client uploads
const generateSignedUploadUrl = (options = {}) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const uploadOptions = {
    timestamp,
    folder: 'expense-tracker',
    ...options,
  };

  const signature = cloudinary.utils.api_sign_request(uploadOptions, process.env.CLOUDINARY_API_SECRET);

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    ...uploadOptions,
  };
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  generateSignedUploadUrl,
  cloudinary,
};
</bolutAction>