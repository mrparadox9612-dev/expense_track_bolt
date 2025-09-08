const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, currency } = req.body;

  // TODO: DATABASE - Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // TODO: DATABASE - Create user
  const user = await User.create({
    name,
    email,
    password,
    currency: currency || 'USD',
  });

  // TODO: AUTH - Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // TODO: EMAIL - Send verification email
  try {
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
    
    const message = `
      Welcome to Expense Tracker! Please verify your email by clicking the link below:
      \n\n${verificationUrl}
      \n\nIf you did not create an account, please ignore this email.
    `;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Expense Tracker',
      message,
    });

    console.log(`Verification email sent to ${user.email}`);
  } catch (err) {
    console.error('Email could not be sent:', err);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // TODO: DATABASE - Check for user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // TODO: AUTH - Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // TODO: AUTH - In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just send a success response as the client will remove the token
  
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  // TODO: DATABASE - Get user from database (req.user is set by auth middleware)
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    currency: req.body.currency,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // TODO: DATABASE - Check if email is being changed and if it's already taken
  if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
    const existingUser = await User.findOne({ email: fieldsToUpdate.email });
    if (existingUser) {
      return next(new ErrorResponse('Email is already taken', 400));
    }
    // If email is changed, mark as unverified
    fieldsToUpdate.isEmailVerified = false;
  }

  // TODO: DATABASE - Update user
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  // TODO: DATABASE - Get user with password field
  const user = await User.findById(req.user.id).select('+password');

  // TODO: AUTH - Check current password
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  // TODO: DATABASE - Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // TODO: AUTH - Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  const message = `
    You are receiving this email because you (or someone else) has requested the reset of a password.
    Please make a PUT request to: \n\n ${resetUrl}
    \n\nIf you did not request this, please ignore this email.
  `;

  try {
    // TODO: EMAIL - Send reset password email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token - Expense Tracker',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (err) {
    console.error('Email could not be sent:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new ErrorResponse('Please provide a password', 400));
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // TODO: DATABASE - Find user by reset token and check if not expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // TODO: DATABASE - Find user by verification token and check if not expired
  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.isEmailVerified) {
    return next(new ErrorResponse('Email is already verified', 400));
  }

  // TODO: AUTH - Generate new verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification url
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

  const message = `
    Please verify your email by clicking the link below:
    \n\n${verificationUrl}
    \n\nIf you did not create an account, please ignore this email.
  `;

  try {
    // TODO: EMAIL - Send verification email
    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Expense Tracker',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (err) {
    console.error('Email could not be sent:', err);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: user,
  });
};