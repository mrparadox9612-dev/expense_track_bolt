const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes - check for valid JWT token
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookie-based auth)
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // TODO: AUTH - Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // TODO: DATABASE - Get user from token and attach to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('No user found with this token', 401));
    }

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user owns the resource
exports.checkOwnership = (Model, resourceIdParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    
    // TODO: DATABASE - Find the resource
    const resource = await Model.findById(resourceId);
    
    if (!resource) {
      return next(new ErrorResponse('Resource not found', 404));
    }

    // Check if resource has an isOwnedBy method
    if (typeof resource.isOwnedBy === 'function') {
      if (!resource.isOwnedBy(req.user.id)) {
        return next(new ErrorResponse('Not authorized to access this resource', 403));
      }
    } else if (resource.userId) {
      // Fallback to checking userId field
      if (resource.userId.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this resource', 403));
      }
    } else {
      return next(new ErrorResponse('Cannot verify resource ownership', 500));
    }

    // Attach resource to request for use in controller
    req.resource = resource;
    next();
  });
};

// Rate limiting for sensitive operations
exports.rateLimitSensitive = asyncHandler(async (req, res, next) => {
  // TODO: CACHE - Implement Redis-based rate limiting for sensitive operations
  // For now, we'll use a simple in-memory approach (not suitable for production)
  
  const key = `rate_limit_${req.user.id}_${req.route.path}`;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // In production, use Redis or similar for distributed rate limiting
  // const attempts = await redis.get(key);
  // if (attempts && attempts >= maxAttempts) {
  //   return next(new ErrorResponse('Too many attempts, please try again later', 429));
  // }
  // await redis.setex(key, windowMs / 1000, (attempts || 0) + 1);

  next();
});

// Check if email is verified (optional middleware)
exports.requireEmailVerification = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new ErrorResponse('Please verify your email address to access this resource', 403));
  }
  next();
});