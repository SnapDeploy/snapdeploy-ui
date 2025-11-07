// Common types used throughout the application

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
}

// Deprecated - use Deployment from deployment.ts instead
export interface OldDeployment {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'pending' | 'running';
  timestamp: string;
  environment: 'production' | 'staging' | 'development';
  service: string;
  version: string;
}

export interface Service {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  uptime: number;
  lastDeployment?: string;
  environment: string;
}

export interface DashboardStats {
  totalDeployments: number;
  activeServices: number;
  successRate: number;
  uptime: number;
}

export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
}

export interface ThemeMode {
  mode: 'light' | 'dark';
}

export type Language = "NODE" | "NODE_TS" | "NEXTJS" | "GO" | "PYTHON";

export * from './deployment';