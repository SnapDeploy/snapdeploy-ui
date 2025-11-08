#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use local OpenAPI spec from snapdeploy-core
// Can be overridden with OPENAPI_SPEC environment variable
const OPENAPI_SPEC = process.env.OPENAPI_SPEC || '../snapdeploy-core/api/openapi.yaml';
const OUTPUT_DIR = 'src/lib/api/generated';

async function generateApiTypes() {
  console.log('🚀 Generating API types from OpenAPI schema...');
  
  try {
    // Resolve the OpenAPI spec path
    const openApiPath = resolve(__dirname, '..', OPENAPI_SPEC);
    
    // Check if file exists (for local files)
    if (!OPENAPI_SPEC.startsWith('http') && !existsSync(openApiPath)) {
      throw new Error(`OpenAPI spec file not found at: ${openApiPath}`);
    }
    
    const specSource = OPENAPI_SPEC.startsWith('http') ? OPENAPI_SPEC : openApiPath;
    console.log(`📄 Using OpenAPI spec: ${specSource}`);
    
    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });
    
    // Generate types using openapi-typescript
    console.log('📝 Generating TypeScript types...');
    execSync(`npx openapi-typescript "${specSource}" -o "${join(OUTPUT_DIR, 'types.ts')}"`, {
      stdio: 'inherit'
    });
    
    // Create API client configuration
    console.log('🔧 Creating API client...');
    const apiClientCode = `import createClient from 'openapi-fetch';
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
`;

    writeFileSync(join(OUTPUT_DIR, 'client.ts'), apiClientCode);
    
    // Create service layer
    console.log('🛠️ Creating service layer...');
    const serviceCode = `import { apiClient } from './client';
import type { components } from './types';

// Type definitions (export all schemas that exist)
export type User = components['schemas']['User'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type Error = components['schemas']['Error'];
export type Repository = components['schemas']['Repository'];
export type UserRepositoriesResponse = components['schemas']['UserRepositoriesResponse'];
export type Pagination = components['schemas']['Pagination'];
export type Project = components['schemas']['Project'];
export type ProjectListResponse = components['schemas']['ProjectListResponse'];
export type CreateProjectRequest = components['schemas']['CreateProjectRequest'];
export type UpdateProjectRequest = components['schemas']['UpdateProjectRequest'];

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

  // Project endpoints
  async getUserProjects(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ) {
    const { data, error } = await apiClient.GET('/users/{id}/projects', {
      params: {
        path: { id: userId },
        query: params
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async getProject(projectId: string) {
    const { data, error } = await apiClient.GET('/projects/{id}', {
      params: {
        path: { id: projectId }
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async createProject(userId: string, request: CreateProjectRequest) {
    const { data, error } = await apiClient.POST('/users/{id}/projects', {
      params: {
        path: { id: userId }
      },
      body: request,
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async updateProject(projectId: string, request: UpdateProjectRequest) {
    const { data, error } = await apiClient.PUT('/projects/{id}', {
      params: {
        path: { id: projectId }
      },
      body: request,
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }

  async deleteProject(projectId: string) {
    const { data, error } = await apiClient.DELETE('/projects/{id}', {
      params: {
        path: { id: projectId }
      },
      headers: this.getHeaders(),
    });
    
    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
`;

    writeFileSync(join(OUTPUT_DIR, 'service.ts'), serviceCode);
    
    // Create index file
    const indexCode = `// Generated API types and client
export * from './types';
export * from './client';
export * from './service';
`;

    writeFileSync(join(OUTPUT_DIR, 'index.ts'), indexCode);
    
    console.log('✅ API generation completed successfully!');
    console.log('📁 Generated files in: ' + OUTPUT_DIR);
    
  } catch (error) {
    console.error('❌ Error generating API types:', error);
    process.exit(1);
  }
}

// Run the generation
generateApiTypes();