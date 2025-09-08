const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Budget must belong to a user'],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
    min: [0.01, 'Budget amount must be greater than 0'],
    max: [999999.99, 'Budget amount cannot exceed 999,999.99'],
  },
  period: {
    type: String,
    required: [true, 'Please select a budget period'],
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date'],
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  alertThreshold: {
    type: Number,
    min: [0, 'Alert threshold cannot be negative'],
    max: [100, 'Alert threshold cannot exceed 100%'],
    default: 80, // Alert when 80% of budget is spent
  },
  notifications: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    lastAlertDate: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

// TODO: DATABASE - Create indexes for better query performance
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });
budgetSchema.index({ userId: 1, period: 1 });

// Ensure unique budget per user per category per period
budgetSchema.index(
  { userId: 1, category: 1, period: 1, startDate: 1 },
  { unique: true }
);

// Virtual for remaining budget
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for percentage spent
budgetSchema.virtual('percentageSpent').get(function() {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
});

// Virtual for is over budget
budgetSchema.virtual('isOverBudget').get(function() {
  return this.spent > this.amount;
});

// Virtual for should alert
budgetSchema.virtual('shouldAlert').get(function() {
  return this.percentageSpent >= this.alertThreshold && !this.notifications.alertSent;
});

// Static method to get active budgets for user
budgetSchema.statics.getActiveBudgets = function(userId) {
  const currentDate = new Date();
  return this.find({
    userId,
    isActive: true,
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
  }).populate('category');
};

// Static method to get budget by category and period
budgetSchema.statics.getBudgetByCategoryAndPeriod = function(userId, categoryId, period, date = new Date()) {
  return this.findOne({
    userId,
    category: categoryId,
    period,
    startDate: { $lte: date },
    endDate: { $gte: date },
    isActive: true,
  }).populate('category');
};

// Static method to get budgets that need alerts
budgetSchema.statics.getBudgetsNeedingAlerts = function() {
  return this.aggregate([
    {
      $match: {
        isActive: true,
        'notifications.alertSent': false,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      },
    },
    {
      $addFields: {
        percentageSpent: {
          $cond: {
            if: { $gt: ['$amount', 0] },
            then: { $multiply: [{ $divide: ['$spent', '$amount'] }, 100] },
            else: 0,
          },
        },
      },
    },
    {
      $match: {
        $expr: { $gte: ['$percentageSpent', '$alertThreshold'] },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$user' },
    { $unwind: '$categoryInfo' },
  ]);
};

// Method to check if user owns this budget
budgetSchema.methods.isOwnedBy = function(userId) {
  return this.userId.toString() === userId.toString();
};

// Method to update spent amount
budgetSchema.methods.updateSpentAmount = async function() {
  const Expense = mongoose.model('Expense');
  
  const result = await Expense.aggregate([
    {
      $match: {
        userId: this.userId,
        category: this.category,
        date: {
          $gte: this.startDate,
          $lte: this.endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);
  
  this.spent = result.length > 0 ? result[0].total : 0;
  return this.save();
};

// Method to mark alert as sent
budgetSchema.methods.markAlertSent = function() {
  this.notifications.alertSent = true;
  this.notifications.lastAlertDate = new Date();
  return this.save();
};

// Pre-save middleware to calculate end date based on period
budgetSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('startDate') || this.isModified('period')) {
    const startDate = new Date(this.startDate);
    
    switch (this.period) {
      case 'weekly':
        this.endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.endDate = new Date(startDate);
        this.endDate.setMonth(this.endDate.getMonth() + 1);
        this.endDate.setDate(this.endDate.getDate() - 1); // Last day of the month
        break;
      case 'quarterly':
        this.endDate = new Date(startDate);
        this.endDate.setMonth(this.endDate.getMonth() + 3);
        this.endDate.setDate(this.endDate.getDate() - 1);
        break;
      case 'yearly':
        this.endDate = new Date(startDate);
        this.endDate.setFullYear(this.endDate.getFullYear() + 1);
        this.endDate.setDate(this.endDate.getDate() - 1);
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);