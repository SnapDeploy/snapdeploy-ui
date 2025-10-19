import { apiClient } from './client';
import type { components } from './types';

// Type definitions
export type User = components['schemas']['User'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type UpdateUserRequest = components['schemas']['UpdateUserRequest'];
export type UserListResponse = components['schemas']['UserListResponse'];
export type Pagination = components['schemas']['Pagination'];
export type Error = components['schemas']['Error'];

// API Service class
export class ApiService {
  private token?: string;

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = undefined;
  }

  get isAuthenticated() {
    return !!this.token;
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

  // User management endpoints
  async getUsers(params?: { page?: number; limit?: number }) {
    const { data, error } = await apiClient.GET('/users', {
      params: {
        query: params,
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await apiClient.GET('/users/{id}', {
      params: {
        path: { id },
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: UpdateUserRequest) {
    const { data, error } = await apiClient.PUT('/users/{id}', {
      params: {
        path: { id },
      },
      body: userData,
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async deleteUser(id: string) {
    const { data, error } = await apiClient.DELETE('/users/{id}', {
      params: {
        path: { id },
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
