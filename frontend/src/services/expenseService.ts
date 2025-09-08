import { apiService } from './api';
import { Expense, ExpenseFormData, Category, AnalyticsData } from '../types';

class ExpenseService {
  // TODO: API - Implement get expenses endpoint call
  async getExpenses(params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ expenses: Expense[]; total: number; pages: number }> {
    try {
      const response = await apiService.get('/expenses', params);
      return response.data;
    } catch (error) {
      console.error('Get expenses service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement create expense endpoint call
  async createExpense(expenseData: ExpenseFormData): Promise<Expense> {
    try {
      const response = await apiService.post<Expense>('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Create expense service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement update expense endpoint call
  async updateExpense(id: string, expenseData: Partial<ExpenseFormData>): Promise<Expense> {
    try {
      const response = await apiService.put<Expense>(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Update expense service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement delete expense endpoint call
  async deleteExpense(id: string): Promise<void> {
    try {
      await apiService.delete(`/expenses/${id}`);
    } catch (error) {
      console.error('Delete expense service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement get expense by id endpoint call
  async getExpenseById(id: string): Promise<Expense> {
    try {
      const response = await apiService.get<Expense>(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get expense by id service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement upload receipt endpoint call
  async uploadReceipt(expenseId: string, imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('receipt', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      } as any);

      const response = await apiService.upload<{ receiptUrl: string }>(
        `/expenses/${expenseId}/receipt`,
        formData
      );
      return response.data.receiptUrl;
    } catch (error) {
      console.error('Upload receipt service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement get categories endpoint call
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<Category[]>('/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement create category endpoint call
  async createCategory(categoryData: {
    name: string;
    icon: string;
    color: string;
  }): Promise<Category> {
    try {
      const response = await apiService.post<Category>('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Create category service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement get analytics endpoint call
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'week' | 'month' | 'year';
  }): Promise<AnalyticsData> {
    try {
      const response = await apiService.get<AnalyticsData>('/expenses/analytics', params);
      return response.data;
    } catch (error) {
      console.error('Get analytics service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement export expenses endpoint call
  async exportExpenses(format: 'csv' | 'pdf', params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<string> {
    try {
      const response = await apiService.get<{ downloadUrl: string }>(
        `/expenses/export/${format}`,
        params
      );
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Export expenses service error:', error);
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();