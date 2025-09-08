// TODO: API - Configure base URL for different environments
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' // Development
    : 'https://your-production-api.com/api', // Production
  TIMEOUT: 10000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
  CURRENCY_PREFERENCE: 'currency_preference',
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'food', color: '#FF6B6B' },
  { id: 'transport', name: 'Transportation', icon: 'car', color: '#4ECDC4' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#45B7D1' },
  { id: 'entertainment', name: 'Entertainment', icon: 'music', color: '#96CEB4' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: '#FFEAA7' },
  { id: 'health', name: 'Healthcare', icon: 'heart', color: '#DDA0DD' },
  { id: 'education', name: 'Education', icon: 'book', color: '#98D8C8' },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#F7DC6F' },
  { id: 'other', name: 'Other', icon: 'more-horizontal', color: '#BDC3C7' },
];

export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];