import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';
import type {  UpdateUserRequest,  } from '@/lib/api/generated';

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
    queryFn: () => api.getHealth(),
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
    queryFn: () => api.getCurrentUser(),
    // Only fetch if user is authenticated
    enabled: api.isAuthenticated,
    // User data is relatively stable
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Users list query
export function useUsers(params?: { page?: number; limit?: number }) {
  const api = useApi();
  
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => api.getUsers(params),
    enabled: api.isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Single user query
export function useUser(id: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => api.getUserById(id),
    enabled: api.isAuthenticated && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update user mutation
export function useUpdateUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      api.updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update the user in cache
      queryClient.setQueryData(queryKeys.user(id), updatedUser);
      
      // If this is the current user, update the current user cache
      queryClient.setQueryData(queryKeys.currentUser, updatedUser);
      
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.user(id) });
      
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
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

