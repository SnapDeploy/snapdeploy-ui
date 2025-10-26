import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

// Query Keys
export const queryKeys = {
  health: ['health'] as const,
  currentUser: ['auth', 'me'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userRepositories: (userId: string) => ['users', userId, 'repositories'] as const,
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
// Utility hook to invalidate all user-related queries
export function useInvalidateUserQueries() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };
}

