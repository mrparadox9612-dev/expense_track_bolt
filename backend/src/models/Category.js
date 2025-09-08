const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Please add an icon'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'Please add a color'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color'],
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null, // null for default categories, userId for custom categories
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// TODO: DATABASE - Create indexes for better query performance
categorySchema.index({ userId: 1, isActive: 1 });
categorySchema.index({ isDefault: 1, isActive: 1 });
categorySchema.index({ name: 1, userId: 1 }, { unique: true });

// Static method to get default categories
categorySchema.statics.getDefaultCategories = function() {
  return [
    {
      name: 'Food & Dining',
      icon: 'food',
      color: '#FF6B6B',
      isDefault: true,
    },
    {
      name: 'Transportation',
      icon: 'car',
      color: '#4ECDC4',
      isDefault: true,
    },
    {
      name: 'Shopping',
      icon: 'shopping-bag',
      color: '#45B7D1',
      isDefault: true,
    },
    {
      name: 'Entertainment',
      icon: 'music',
      color: '#96CEB4',
      isDefault: true,
    },
    {
      name: 'Bills & Utilities',
      icon: 'receipt',
      color: '#FFEAA7',
      isDefault: true,
    },
    {
      name: 'Healthcare',
      icon: 'heart',
      color: '#DDA0DD',
      isDefault: true,
    },
    {
      name: 'Education',
      icon: 'book',
      color: '#98D8C8',
      isDefault: true,
    },
    {
      name: 'Travel',
      icon: 'airplane',
      color: '#F7DC6F',
      isDefault: true,
    },
    {
      name: 'Other',
      icon: 'more-horizontal',
      color: '#BDC3C7',
      isDefault: true,
    },
  ];
};

// Method to check if user can modify this category
categorySchema.methods.canUserModify = function(userId) {
  // Users can only modify their own custom categories
  return !this.isDefault && this.userId && this.userId.toString() === userId.toString();
};

module.exports = mongoose.model('Category', categorySchema);