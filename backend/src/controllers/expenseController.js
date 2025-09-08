const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  // Build query
  const query = { userId: req.user.id };

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  // Search in description and tags
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // TODO: DATABASE - Execute query with pagination
  const expenses = await Expense.find(query)
    .populate('category')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // TODO: DATABASE - Get total count for pagination
  const total = await Expense.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = asyncHandler(async (req, res, next) => {
  // TODO: DATABASE - Find expense by ID and populate category
  const expense = await Expense.findById(req.params.id).populate('category');

  if (!expense) {
    return next(new ErrorResponse('Expense not found', 404));
  }

  // Make sure user owns expense
  if (!expense.isOwnedBy(req.user.id)) {
    return next(new ErrorResponse('Not authorized to access this expense', 401));
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = asyncHandler(async (req, res, next) => {
  const { amount, description, category, date, tags, paymentMethod, location } = req.body;

  // TODO: DATABASE - Verify category exists and user has access to it
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if category belongs to user or is a default category
  if (categoryDoc.userId && !categoryDoc.userId.equals(req.user.id)) {
    return next(new ErrorResponse('Not authorized to use this category', 401));
  }

  // Add user to req.body
  req.body.userId = req.user.id;

  // TODO: DATABASE - Create expense
  const expense = await Expense.create(req.body);

  // TODO: DATABASE - Populate category information
  await expense.populate('category');

  // TODO: DATABASE - Update related budgets
  await updateBudgetSpent(req.user.id, category, new Date(date));

  res.status(201).json({
    success: true,
    data: expense,
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = asyncHandler(async (req, res, next) => {
  let expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new ErrorResponse('Expense not found', 404));
  }

  // Make sure user owns expense
  if (!expense.isOwnedBy(req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this expense', 401));
  }

  // If category is being changed, verify new category
  if (req.body.category && req.body.category !== expense.category.toString()) {
    const categoryDoc = await Category.findById(req.body.category);
    if (!categoryDoc) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // Check if category belongs to user or is a default category
    if (categoryDoc.userId && !categoryDoc.userId.equals(req.user.id)) {
      return next(new ErrorResponse('Not authorized to use this category', 401));
    }
  }

  const oldCategory = expense.category;
  const oldDate = expense.date;

  // TODO: DATABASE - Update expense
  expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');

  // TODO: DATABASE - Update budgets if category or date changed
  if (req.body.category && req.body.category !== oldCategory.toString()) {
    // Update old category budget
    await updateBudgetSpent(req.user.id, oldCategory, oldDate);
    // Update new category budget
    await updateBudgetSpent(req.user.id, expense.category._id, expense.date);
  } else if (req.body.date && new Date(req.body.date).getTime() !== oldDate.getTime()) {
    // Update budget for date change
    await updateBudgetSpent(req.user.id, expense.category._id, expense.date);
  }

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new ErrorResponse('Expense not found', 404));
  }

  // Make sure user owns expense
  if (!expense.isOwnedBy(req.user.id)) {
    return next(new ErrorResponse('Not authorized to delete this expense', 401));
  }

  // TODO: FILE - Delete receipt image if exists
  if (expense.receipt) {
    try {
      await deleteFromCloudinary(expense.receipt);
    } catch (error) {
      console.error('Error deleting receipt image:', error);
    }
  }

  // TODO: DATABASE - Remove expense
  await expense.deleteOne();

  // TODO: DATABASE - Update related budgets
  await updateBudgetSpent(req.user.id, expense.category, expense.date);

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
  });
});

// @desc    Upload receipt for expense
// @route   POST /api/expenses/:id/receipt
// @access  Private
exports.uploadReceipt = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new ErrorResponse('Expense not found', 404));
  }

  // Make sure user owns expense
  if (!expense.isOwnedBy(req.user.id)) {
    return next(new ErrorResponse('Not authorized to update this expense', 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  try {
    // TODO: FILE - Delete old receipt if exists
    if (expense.receipt) {
      await deleteFromCloudinary(expense.receipt);
    }

    // TODO: FILE - Upload new receipt to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'expense-receipts',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { format: 'jpg' },
      ],
    });

    // TODO: DATABASE - Update expense with receipt URL
    expense.receipt = result.secure_url;
    await expense.save();

    res.status(200).json({
      success: true,
      data: {
        receiptUrl: result.secure_url,
      },
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return next(new ErrorResponse('Error uploading receipt', 500));
  }
});

// @desc    Get expense analytics
// @route   GET /api/expenses/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, period = 'month' } = req.query;

  // Set default date range based on period
  let start, end;
  const now = new Date();

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case 'week':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
  }

  // TODO: DATABASE - Get total expenses
  const totalExpensesResult = await Expense.getTotalExpenses(req.user.id, start, end);
  const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
  const expenseCount = totalExpensesResult.length > 0 ? totalExpensesResult[0].count : 0;

  // TODO: DATABASE - Get expenses by category
  const categoryBreakdown = await Expense.getExpensesByCategories(req.user.id, start, end);

  // Calculate percentages for category breakdown
  const categoryData = categoryBreakdown.map(item => ({
    category: item.categoryName,
    amount: item.total,
    percentage: totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0,
    count: item.count,
    color: item.categoryColor,
    icon: item.categoryIcon,
  }));

  // TODO: DATABASE - Get monthly trend (last 12 months)
  const monthlyTrend = await Expense.aggregate([
    {
      $match: {
        userId: req.user.id,
        date: {
          $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
          $lte: end,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
    {
      $project: {
        month: {
          $dateToString: {
            format: '%Y-%m',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: 1,
              },
            },
          },
        },
        expenses: '$total',
        count: '$count',
      },
    },
  ]);

  // TODO: DATABASE - Get average daily spending
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const averageDaily = daysDiff > 0 ? totalExpenses / daysDiff : 0;

  res.status(200).json({
    success: true,
    data: {
      totalExpenses,
      expenseCount,
      averageDaily: Math.round(averageDaily * 100) / 100,
      period: {
        start,
        end,
        days: daysDiff,
      },
      categoryBreakdown: categoryData,
      monthlyTrend,
    },
  });
});

// @desc    Export expenses
// @route   GET /api/expenses/export/:format
// @access  Private
exports.exportExpenses = asyncHandler(async (req, res, next) => {
  const { format } = req.params;
  const { startDate, endDate, category } = req.query;

  if (!['csv', 'pdf'].includes(format)) {
    return next(new ErrorResponse('Invalid export format. Use csv or pdf', 400));
  }

  // Build query
  const query = { userId: req.user.id };

  if (category) {
    query.category = category;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  // TODO: DATABASE - Get expenses for export
  const expenses = await Expense.find(query)
    .populate('category')
    .sort({ date: -1 });

  if (format === 'csv') {
    // TODO: FILE - Generate CSV export
    const csv = generateCSV(expenses);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.status(200).send(csv);
  } else if (format === 'pdf') {
    // TODO: FILE - Generate PDF export (would need PDF library like puppeteer or pdfkit)
    return next(new ErrorResponse('PDF export not implemented yet', 501));
  }
});

// Helper function to update budget spent amount
const updateBudgetSpent = async (userId, categoryId, date) => {
  try {
    // TODO: DATABASE - Find active budgets for this category and date
    const budgets = await Budget.find({
      userId,
      category: categoryId,
      isActive: true,
      startDate: { $lte: date },
      endDate: { $gte: date },
    });

    // Update spent amount for each budget
    for (const budget of budgets) {
      await budget.updateSpentAmount();
    }
  } catch (error) {
    console.error('Error updating budget spent amount:', error);
  }
};

// Helper function to generate CSV
const generateCSV = (expenses) => {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Tags'];
  const rows = expenses.map(expense => [
    expense.date.toISOString().split('T')[0],
    expense.description,
    expense.category.name,
    expense.amount,
    expense.paymentMethod || '',
    expense.tags.join('; '),
  ]);

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};