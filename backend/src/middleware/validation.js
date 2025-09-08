const { body, validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});

    return next(new ErrorResponse('Validation failed', 400, errorMessages));
  }
  next();
};

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency code'),
  
  handleValidationErrors,
];

// User login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors,
];

// Forgot password validation
exports.validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors,
];

// Reset password validation
exports.validateResetPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors,
];

// Update password validation
exports.validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors,
];

// Expense validation
exports.validateExpense = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Amount must be between 0.01 and 999,999.99'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be 30 characters or less'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'])
    .withMessage('Invalid payment method'),
  
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('location.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  
  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be 200 characters or less'),
  
  handleValidationErrors,
];

// Category validation
exports.validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  
  body('icon')
    .trim()
    .notEmpty()
    .withMessage('Icon is required'),
  
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  
  handleValidationErrors,
];

// Budget validation
exports.validateBudget = [
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Budget amount must be between 0.01 and 999,999.99'),
  
  body('period')
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid budget period'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('alertThreshold')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alert threshold must be between 0 and 100'),
  
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification setting must be boolean'),
  
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification setting must be boolean'),
  
  handleValidationErrors,
];

// Income validation
exports.validateIncome = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Amount must be between 0.01 and 999,999.99'),
  
  body('source')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Source must be between 1 and 100 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('recurring')
    .optional()
    .isBoolean()
    .withMessage('Recurring must be boolean'),
  
  body('frequency')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Invalid frequency'),
  
  handleValidationErrors,
];

// Generic MongoDB ObjectId validation
exports.validateObjectId = (paramName) => [
  body(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  
  handleValidationErrors,
];

// File upload validation
exports.validateFileUpload = (allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(new ErrorResponse(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400));
    }

    // Check file size
    if (req.file.size > maxSize) {
      return next(new ErrorResponse(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`, 400));
    }

    next();
  };
};