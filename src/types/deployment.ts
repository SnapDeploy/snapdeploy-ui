// Re-export deployment types from generated API types
import type { components } from '../lib/api/generated/types';

// Base type from generated API - extended with TTL fields
type BaseDeployment = components['schemas']['Deployment'];

// Extended Deployment type with TTL fields and EXPIRED status
export interface Deployment extends Omit<BaseDeployment, 'status'> {
  status?: 'PENDING' | 'BUILDING' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK' | 'EXPIRED';
  expires_at?: string | null;
  extended_count?: number;
  can_extend?: boolean;
}

export type CreateDeploymentRequest = components['schemas']['CreateDeploymentRequest'];
export type UpdateDeploymentStatusRequest = components['schemas']['UpdateDeploymentStatusRequest'];
export type AppendDeploymentLogRequest = components['schemas']['AppendDeploymentLogRequest'];
export type DeploymentListResponse = components['schemas']['DeploymentListResponse'];

// Response type for extending deployment TTL
export interface ExtendDeploymentResponse {
  id: string;
  expires_at: string;
  extended_count: number;
  can_extend: boolean;
}

// Additional deployment-related types and constants
export const DEPLOYMENT_STATUSES = [
  'PENDING',
  'BUILDING',
  'DEPLOYING',
  'DEPLOYED',
  'FAILED',
  'ROLLED_BACK',
  'EXPIRED',
] as const;

export type DeploymentStatus = typeof DEPLOYMENT_STATUSES[number];

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  PENDING: 'Pending',
  BUILDING: 'Building',
  DEPLOYING: 'Deploying',
  DEPLOYED: 'Deployed',
  FAILED: 'Failed',
  ROLLED_BACK: 'Rolled Back',
  EXPIRED: 'Expired',
};

export const DEPLOYMENT_STATUS_ICONS: Record<DeploymentStatus, string> = {
  PENDING: '⏳',
  BUILDING: '🔨',
  DEPLOYING: '🚀',
  DEPLOYED: '✅',
  FAILED: '❌',
  ROLLED_BACK: '↩️',
  EXPIRED: '⏱️',
};

// TTL-related constants
export const DEFAULT_TTL_HOURS = 6;
export const MAX_EXTENSIONS = 3;

// Form initial values
export interface DeploymentFormValues {
  project_id: string;
  commit_hash: string;
  branch: string;
}

export const getDefaultDeploymentFormValues = (
  projectId?: string
): DeploymentFormValues => ({
  project_id: projectId || '',
  commit_hash: '',
  branch: 'main',
});

