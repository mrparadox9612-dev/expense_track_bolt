const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Expense must belong to a user'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be greater than 0'],
    max: [999999.99, 'Amount cannot exceed 999,999.99'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now,
  },
  receipt: {
    type: String,
    default: null, // URL to receipt image
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters'],
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
    address: String,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'other',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    },
  },
  nextRecurringDate: {
    type: Date,
    required: function() {
      return this.isRecurring;
    },
  },
}, {
  timestamps: true,
});

// TODO: DATABASE - Create indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ date: 1 });
expenseSchema.index({ tags: 1 });
expenseSchema.index({ location: '2dsphere' });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return this.amount.toFixed(2);
});

// Static method to get expenses by date range
expenseSchema.statics.getExpensesByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).populate('category').sort({ date: -1 });
};

// Static method to get expenses by category
expenseSchema.statics.getExpensesByCategory = function(userId, categoryId, limit = null) {
  const query = this.find({ userId, category: categoryId })
    .populate('category')
    .sort({ date: -1 });
  
  if (limit) {
    query.limit(limit);
  }
  
  return query;
};

// Static method to get total expenses for a user
expenseSchema.statics.getTotalExpenses = function(userId, startDate = null, endDate = null) {
  const matchQuery = { userId };
  
  if (startDate && endDate) {
    matchQuery.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to get expenses grouped by category
expenseSchema.statics.getExpensesByCategories = function(userId, startDate = null, endDate = null) {
  const matchQuery = { userId };
  
  if (startDate && endDate) {
    matchQuery.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        categoryColor: { $first: '$categoryInfo.color' },
        categoryIcon: { $first: '$categoryInfo.icon' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        expenses: { $push: '$$ROOT' },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// Method to check if user owns this expense
expenseSchema.methods.isOwnedBy = function(userId) {
  return this.userId.toString() === userId.toString();
};

// Pre-save middleware to handle recurring expenses
expenseSchema.pre('save', function(next) {
  if (this.isRecurring && this.isNew) {
    // Calculate next recurring date based on frequency
    const currentDate = this.date || new Date();
    
    switch (this.recurringFrequency) {
      case 'daily':
        this.nextRecurringDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        this.nextRecurringDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.nextRecurringDate = new Date(currentDate);
        this.nextRecurringDate.setMonth(this.nextRecurringDate.getMonth() + 1);
        break;
      case 'yearly':
        this.nextRecurringDate = new Date(currentDate);
        this.nextRecurringDate.setFullYear(this.nextRecurringDate.getFullYear() + 1);
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);