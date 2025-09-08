import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../constants/config';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TODO: AUTH - Check if user has valid token in secure storage
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // TODO: API - Verify token is still valid with backend
        // const isValid = await authService.verifyToken(token);
        // if (!isValid) {
        //   await logout();
        // }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // TODO: API - Call login endpoint
      const response: AuthResponse = await authService.login(credentials);
      
      // Store token and user data securely
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      
      // TODO: API - Call register endpoint
      const response: AuthResponse = await authService.register(credentials);
      
      // Store token and user data securely
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // TODO: API - Call logout endpoint to invalidate token
      // await authService.logout();
      
      // Clear stored data
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // TODO: API - Call forgot password endpoint
      await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      // TODO: API - Call reset password endpoint
      await authService.resetPassword(token, password);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};