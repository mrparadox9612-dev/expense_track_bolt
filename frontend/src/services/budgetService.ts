import { apiService } from './api';
import { Budget, BudgetFormData } from '../types';

class BudgetService {
  // TODO: API - Implement get budgets endpoint call
  async getBudgets(): Promise<Budget[]> {
    try {
      const response = await apiService.get<Budget[]>('/budgets');
      return response.data;
    } catch (error) {
      console.error('Get budgets service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement create budget endpoint call
  async createBudget(budgetData: BudgetFormData): Promise<Budget> {
    try {
      const response = await apiService.post<Budget>('/budgets', budgetData);
      return response.data;
    } catch (error) {
      console.error('Create budget service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement update budget endpoint call
  async updateBudget(id: string, budgetData: Partial<BudgetFormData>): Promise<Budget> {
    try {
      const response = await apiService.put<Budget>(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Update budget service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement delete budget endpoint call
  async deleteBudget(id: string): Promise<void> {
    try {
      await apiService.delete(`/budgets/${id}`);
    } catch (error) {
      console.error('Delete budget service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement get budget by id endpoint call
  async getBudgetById(id: string): Promise<Budget> {
    try {
      const response = await apiService.get<Budget>(`/budgets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get budget by id service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement get budget status endpoint call
  async getBudgetStatus(id: string): Promise<{
    budget: Budget;
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
  }> {
    try {
      const response = await apiService.get(`/budgets/${id}/status`);
      return response.data;
    } catch (error) {
      console.error('Get budget status service error:', error);
      throw error;
    }
  }
}

export const budgetService = new BudgetService();