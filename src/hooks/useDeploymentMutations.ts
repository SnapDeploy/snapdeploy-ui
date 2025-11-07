import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '../lib/api/generated/client';
import type { components } from '../lib/api/generated/types';

type CreateDeploymentRequest = components['schemas']['CreateDeploymentRequest'];
type Deployment = components['schemas']['Deployment'];
type UpdateDeploymentStatusRequest = components['schemas']['UpdateDeploymentStatusRequest'];
type AppendDeploymentLogRequest = components['schemas']['AppendDeploymentLogRequest'];

export const useDeploymentMutations = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const createDeployment = useMutation({
    mutationFn: async (data: CreateDeploymentRequest) => {
      const token = await getToken();
      const response = await apiClient.POST('/deployments', {
        body: data,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create deployment');
      }
      
      return response.data as Deployment;
    },
    onSuccess: (deployment: Deployment) => {
      // Invalidate project deployments query
      queryClient.invalidateQueries({ 
        queryKey: ['projects', deployment.project_id, 'deployments'] 
      });
      // Invalidate user deployments query
      queryClient.invalidateQueries({ 
        queryKey: ['users', deployment.user_id, 'deployments'] 
      });
    },
  });

  const updateDeploymentStatus = useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateDeploymentStatusRequest 
    }) => {
      const token = await getToken();
      const response = await apiClient.PATCH('/deployments/{id}/status', {
        params: { path: { id } },
        body: data,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to update deployment status');
      }
      
      return response.data as Deployment;
    },
    onSuccess: (deployment: Deployment, variables: { id: string; data: UpdateDeploymentStatusRequest }) => {
      // Update deployment in cache
      queryClient.setQueryData(['deployments', variables.id], deployment);
      // Invalidate project deployments
      queryClient.invalidateQueries({ 
        queryKey: ['projects', deployment.project_id, 'deployments'] 
      });
    },
  });

  const appendDeploymentLog = useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: AppendDeploymentLogRequest 
    }) => {
      const token = await getToken();
      const response = await apiClient.POST('/deployments/{id}/logs', {
        params: { path: { id } },
        body: data,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to append log');
      }
      
      return response.data as Deployment;
    },
    onSuccess: (deployment: Deployment, variables: { id: string; data: AppendDeploymentLogRequest }) => {
      // Update deployment in cache
      queryClient.setQueryData(['deployments', variables.id], deployment);
    },
  });

  const deleteDeployment = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const response = await apiClient.DELETE('/deployments/{id}', {
        params: { path: { id } },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete deployment');
      }
      
      return id;
    },
    onSuccess: (id: string) => {
      // Invalidate deployment queries
      queryClient.invalidateQueries({ queryKey: ['deployments', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
  });

  return {
    createDeployment,
    updateDeploymentStatus,
    appendDeploymentLog,
    deleteDeployment,
  };
};

