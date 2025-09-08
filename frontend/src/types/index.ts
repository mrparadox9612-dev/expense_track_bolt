export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: Category;
  date: string;
  receipt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string;
  date: string;
  recurring: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: Category;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  categoryId: string;
  date: Date;
  receipt?: string;
  tags: string[];
}

export interface BudgetFormData {
  categoryId: string;
  amount: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
}

export interface AnalyticsData {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    expenses: number;
    income: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}