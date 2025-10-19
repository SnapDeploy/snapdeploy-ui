import createClient from 'openapi-fetch';
import type { paths } from './types';

// Create the API client
export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => ({
  Authorization: 'Bearer ' + token,
});

// Export types for convenience
export type { paths } from './types';
export type { components } from './types';
