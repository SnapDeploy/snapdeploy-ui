import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { apiClient } from '../lib/api/generated/client';
import type { components } from '../lib/api/generated/types';

type Deployment = components['schemas']['Deployment'];
type DeploymentListResponse = components['schemas']['DeploymentListResponse'];

/**
 * Hook to fetch a single deployment by ID
 */
export const useDeployment = (id: string | undefined, options?: { autoRefresh?: boolean }) => {
  const autoRefresh = options?.autoRefresh ?? true;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const previousStatusRef = useRef<string | undefined>(undefined);
  
  const query = useQuery({
    queryKey: ['deployments', id],
    queryFn: async () => {
      if (!id) throw new Error('Deployment ID is required');
      
      const token = await getToken();
      const response = await apiClient.GET('/deployments/{id}', {
        params: { path: { id } },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch deployment');
      }
      
      return response.data as Deployment;
    },
    enabled: !!id,
    refetchInterval: autoRefresh ? 2000 : false,
  });

  // Invalidate list queries when deployment status changes to terminal
  useEffect(() => {
    const deployment = query.data;
    if (!deployment) return;

    const currentStatus = deployment.status;
    const previousStatus = previousStatusRef.current;

    // Check if status changed from in-progress to terminal
    if (previousStatus && 
        isDeploymentInProgress(previousStatus) && 
        isDeploymentTerminal(currentStatus || '')) {
      // Invalidate all deployment list queries
      queryClient.invalidateQueries({ queryKey: ['projects', deployment.project_id, 'deployments'] });
      queryClient.invalidateQueries({ queryKey: ['users', deployment.user_id, 'deployments'] });
      queryClient.invalidateQueries({ queryKey: ['projects', deployment.project_id, 'deployments', 'latest'] });
    }

    previousStatusRef.current = currentStatus || undefined;
  }, [query.data?.status, query.data?.project_id, query.data?.user_id, queryClient]);

  return query;
};

/**
 * Hook to fetch deployments for a project
 */
export const useProjectDeployments = (
  projectId: string | undefined,
  page: number = 1,
  limit: number = 20
) => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['projects', projectId, 'deployments', { page, limit }],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const token = await getToken();
      const response = await apiClient.GET('/projects/{id}/deployments', {
        params: { 
          path: { id: projectId },
          query: { page, limit }
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch deployments');
      }
      
      return response.data as DeploymentListResponse;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook to fetch the latest deployment for a project
 */
export const useLatestProjectDeployment = (projectId: string | undefined, autoRefresh = true) => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['projects', projectId, 'deployments', 'latest'],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const token = await getToken();
      const response = await apiClient.GET('/projects/{id}/deployments/latest', {
        params: { path: { id: projectId } },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        // Return null if no deployments found (404)
        if (response.error.error === 'not_found') {
          return null;
        }
        throw new Error(response.error.message || 'Failed to fetch latest deployment');
      }
      
      return response.data as Deployment;
    },
    enabled: !!projectId,
    refetchInterval: autoRefresh ? 2000 : false, // Auto-refresh every 2 seconds
  });
};

/**
 * Hook to fetch deployments for a user
 */
export const useUserDeployments = (
  userId: string | undefined,
  page: number = 1,
  limit: number = 20
) => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['users', userId, 'deployments', { page, limit }],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const token = await getToken();
      console.log('[DEBUG] useUserDeployments - userId:', userId);
      console.log('[DEBUG] useUserDeployments - token exists:', !!token);
      
      const response = await apiClient.GET('/users/{id}/deployments', {
        params: { 
          path: { id: userId },
          query: { page, limit }
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        console.error('[DEBUG] useUserDeployments error:', response.error);
        throw new Error(response.error.message || 'Failed to fetch deployments');
      }
      
      return response.data as DeploymentListResponse;
    },
    enabled: !!userId,
  });
};

/**
 * Helper function to get deployment status color
 */
export const getDeploymentStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'text-gray-500 bg-gray-100';
    case 'BUILDING':
      return 'text-blue-500 bg-blue-100';
    case 'DEPLOYING':
      return 'text-indigo-500 bg-indigo-100';
    case 'DEPLOYED':
      return 'text-green-500 bg-green-100';
    case 'FAILED':
      return 'text-red-500 bg-red-100';
    case 'ROLLED_BACK':
      return 'text-yellow-500 bg-yellow-100';
    default:
      return 'text-gray-500 bg-gray-100';
  }
};

/**
 * Helper function to check if deployment is in progress
 */
export const isDeploymentInProgress = (status: string): boolean => {
  return ['PENDING', 'BUILDING', 'DEPLOYING'].includes(status);
};

/**
 * Helper function to check if deployment is terminal (completed/failed)
 */
export const isDeploymentTerminal = (status: string): boolean => {
  return ['DEPLOYED', 'FAILED', 'ROLLED_BACK'].includes(status);
};

