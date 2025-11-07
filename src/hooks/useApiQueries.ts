import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

// Query Keys
export const queryKeys = {
  health: ['health'] as const,
  currentUser: ['auth', 'me'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userRepositories: (userId: string) => ['users', userId, 'repositories'] as const,
  projects: ['projects'] as const,
  userProjects: (userId: string) => ['users', userId, 'projects'] as const,
  project: (id: string) => ['projects', id] as const,
} as const;

// Health check query
export function useHealth() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.apiService.getHealth(),
    // Health check should be fresh every time
    staleTime: 0,
    gcTime: 0,
  });
}

// Current user query
export function useCurrentUser() {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => api.apiService.getCurrentUser(),
    // Only fetch if user is authenticated
    enabled: api.isSignedIn,
    // User data is relatively stable
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// User repositories query with pagination and search
export function useUserRepositories(
  userId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.userRepositories(userId || ''), params],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return api.apiService.getUserRepositories(userId, params);
    },
    enabled: !!userId && api.isSignedIn,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// User projects query with pagination
export function useUserProjects(
  userId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.userProjects(userId || ''), params],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      
      const startTime = performance.now();
      console.log('[PERF] getUserProjects starting...', { userId, params });
      
      const result = await api.apiService.getUserProjects(userId, params);
      
      const duration = performance.now() - startTime;
      console.log(`[PERF] getUserProjects completed in ${duration.toFixed(2)}ms`);
      
      return result;
    },
    enabled: !!userId && api.isSignedIn,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1, // Only retry once on failure
  });
}

// Project query
export function useProject(projectId: string | undefined) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.project(projectId || ''),
    queryFn: () => {
      if (!projectId) throw new Error('Project ID is required');
      return api.apiService.getProject(projectId);
    },
    enabled: !!projectId && api.isSignedIn,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Utility hook to invalidate all user-related queries
export function useInvalidateUserQueries() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };
}

// Utility hook to invalidate project queries
export function useInvalidateProjectQueries() {
  const queryClient = useQueryClient();
  
  return (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProjects(userId) });
    }
  };
}
