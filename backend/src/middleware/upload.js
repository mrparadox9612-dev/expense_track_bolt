const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // TODO: FILE - Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Invalid file type. Only JPEG, JPG, PNG and GIF files are allowed', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file per request
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ErrorResponse('File too large. Maximum size is 5MB', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ErrorResponse('Too many files. Only 1 file allowed', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ErrorResponse('Unexpected file field', 400));
    }
  }
  next(err);
};

// Middleware to handle upload errors
upload.errorHandler = handleMulterError;

module.exports = upload;