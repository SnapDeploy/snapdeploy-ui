// Re-export deployment types from generated API types
import type { components } from '../lib/api/generated/types';

export type Deployment = components['schemas']['Deployment'];
export type CreateDeploymentRequest = components['schemas']['CreateDeploymentRequest'];
export type UpdateDeploymentStatusRequest = components['schemas']['UpdateDeploymentStatusRequest'];
export type AppendDeploymentLogRequest = components['schemas']['AppendDeploymentLogRequest'];
export type DeploymentListResponse = components['schemas']['DeploymentListResponse'];

// Additional deployment-related types and constants
export const DEPLOYMENT_STATUSES = [
  'PENDING',
  'BUILDING',
  'DEPLOYING',
  'DEPLOYED',
  'FAILED',
  'ROLLED_BACK',
] as const;

export type DeploymentStatus = typeof DEPLOYMENT_STATUSES[number];

export const DEPLOYMENT_STATUS_LABELS: Record<DeploymentStatus, string> = {
  PENDING: 'Pending',
  BUILDING: 'Building',
  DEPLOYING: 'Deploying',
  DEPLOYED: 'Deployed',
  FAILED: 'Failed',
  ROLLED_BACK: 'Rolled Back',
};

export const DEPLOYMENT_STATUS_ICONS: Record<DeploymentStatus, string> = {
  PENDING: '⏳',
  BUILDING: '🔨',
  DEPLOYING: '🚀',
  DEPLOYED: '✅',
  FAILED: '❌',
  ROLLED_BACK: '↩️',
};

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

