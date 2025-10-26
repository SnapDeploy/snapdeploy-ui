import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

// Query Keys
export const queryKeys = {
  health: ['health'] as const,
  currentUser: ['auth', 'me'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
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
// Utility hook to invalidate all user-related queries
export function useInvalidateUserQueries() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
    queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
  };
}

