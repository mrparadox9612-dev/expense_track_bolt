const express = require('express');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateUpdatePassword } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resettoken', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/update-password', validateUpdatePassword, updatePassword);
router.post('/resend-verification', resendVerification);

module.exports = router;