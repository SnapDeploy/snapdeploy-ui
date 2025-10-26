import { apiClient } from './client';
import type { components } from './types';

// Type definitions (export all schemas that exist)
export type User = components['schemas']['User'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type Error = components['schemas']['Error'];
export type Repository = components['schemas']['Repository'];
export type UserRepositoriesResponse = components['schemas']['UserRepositoriesResponse'];
export type Pagination = components['schemas']['Pagination'];

// API Service class
export class ApiService {
  private token?: string;

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = undefined;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = 'Bearer ' + this.token;
    }
    
    return headers;
  }

  // Health endpoints
  async getHealth() {
    const { data, error } = await apiClient.GET('/health', {
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  // Authentication endpoints
  async getCurrentUser() {
    const { data, error } = await apiClient.GET('/auth/me', {
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  // Repository endpoints
  async syncUserRepositories(userId: string) {
    const { data, error } = await apiClient.POST('/users/{id}/repos/sync', {
      params: {
        path: { id: userId }
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async getUserRepositories(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) {
    const { data, error } = await apiClient.GET('/users/{id}/repos', {
      params: {
        path: { id: userId },
        query: params
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
