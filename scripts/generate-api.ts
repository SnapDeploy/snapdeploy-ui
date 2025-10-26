#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OPENAPI_URL = 'https://raw.githubusercontent.com/SnapDeploy/snapdeploy-core/main/api/openapi.yaml';
const OUTPUT_DIR = 'src/lib/api/generated';

async function generateApiTypes() {
  console.log('🚀 Generating API types from OpenAPI schema...');
  
  try {
    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });
    
    // Generate types using openapi-typescript
    console.log('📝 Generating TypeScript types...');
    execSync(`npx openapi-typescript "${OPENAPI_URL}" -o "${join(OUTPUT_DIR, 'types.ts')}"`, {
      stdio: 'inherit'
    });
    
    // Create API client configuration
    console.log('🔧 Creating API client...');
    const apiClientCode = `import createClient from 'openapi-fetch';
import type { paths } from './types';

// Create the API client
export const apiClient = createClient<paths>({
  baseUrl: 'https://core-dev.snap-deploy.com/api/v1',
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
    const serviceCode = `import { apiClient, getAuthHeaders } from './client';
import type { components, paths } from './types';

// Type definitions (export all schemas that exist)
export type User = components['schemas']['User'];
export type HealthResponse = components['schemas']['HealthResponse'];
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