import { apiService } from './api';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  ForgotPasswordData,
  ResetPasswordData,
  User 
} from '../types';

class AuthService {
  // TODO: API - Implement login endpoint call
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement register endpoint call
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement forgot password endpoint call
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement reset password endpoint call
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiService.post('/auth/reset-password', { token, password });
    } catch (error) {
      console.error('Reset password service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement logout endpoint call
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement get profile endpoint call
  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement update profile endpoint call
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile service error:', error);
      throw error;
    }
  }

  // TODO: API - Implement verify token endpoint call
  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiService.post('/auth/verify-token', { token });
      return true;
    } catch (error) {
      console.error('Verify token service error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();