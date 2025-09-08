const express = require('express');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  getAnalytics,
  exportExpenses,
} = require('../controllers/expenseController');

const { protect } = require('../middleware/auth');
const { validateExpense } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(validateExpense, createExpense);

router.route('/analytics')
  .get(getAnalytics);

router.route('/export/:format')
  .get(exportExpenses);

router.route('/:id')
  .get(getExpense)
  .put(validateExpense, updateExpense)
  .delete(deleteExpense);

router.route('/:id/receipt')
  .post(upload.single('receipt'), uploadReceipt);

module.exports = router;