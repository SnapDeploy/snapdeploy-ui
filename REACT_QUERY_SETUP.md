# React Query Setup

This document describes the React Query (TanStack Query) setup for the SnapDeploy dashboard.

## Overview

React Query is configured to work with the generated API client for:

- **Data fetching** with automatic caching
- **Background refetching** and synchronization
- **Optimistic updates** for mutations
- **Error handling** and retry logic
- **Loading states** management

## Setup

### 1. Query Client Configuration

```typescript
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3, // Retry failed requests 3 times
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});
```

### 2. Provider Setup

```typescript
// src/main.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>
);
```

## Available Hooks

### Query Hooks

```typescript
// Health check
const { data, isLoading, error } = useHealth();

// Current user
const { data: user, isLoading, error } = useCurrentUser();

// Users list with pagination
const { data: users, isLoading, error } = useUsers({ page: 1, limit: 10 });

// Single user
const { data: user, isLoading, error } = useUser(userId);
```

### Mutation Hooks

```typescript
// Update user
const updateUser = useUpdateUser();
await updateUser.mutateAsync({ id: userId, data: userData });

// Delete user
const deleteUser = useDeleteUser();
await deleteUser.mutateAsync(userId);
```

### Utility Hooks

```typescript
// Invalidate user queries
const invalidateQueries = useInvalidateUserQueries();
invalidateQueries();
```

## Query Keys

All queries use consistent key patterns:

```typescript
export const queryKeys = {
  health: ["health"] as const,
  currentUser: ["auth", "me"] as const,
  users: ["users"] as const,
  user: (id: string) => ["users", id] as const,
} as const;
```

## Features

### 🔄 Automatic Caching

- **Stale-while-revalidate** strategy
- **Background refetching** when data becomes stale
- **Intelligent cache invalidation**

### 🔐 Authentication Integration

- **Automatic token handling** via Clerk
- **Conditional queries** based on auth state
- **Token refresh** support

### ⚡ Performance Optimizations

- **Request deduplication** for identical queries
- **Optimistic updates** for mutations
- **Background synchronization**

### 🛠️ Developer Experience

- **React Query DevTools** for debugging
- **Type-safe** query keys and parameters
- **Consistent error handling**

## Usage Examples

### Basic Query

```typescript
function ProfilePage() {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Welcome, {user?.username}!</div>;
}
```

### Mutation with Optimistic Updates

```typescript
function UpdateUserForm() {
  const updateUser = useUpdateUser();

  const handleSubmit = async (formData) => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: formData,
      });
      // Success - UI automatically updates
    } catch (error) {
      // Error handling
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Manual Cache Management

```typescript
function UserActions() {
  const queryClient = useQueryClient();
  const invalidateQueries = useInvalidateUserQueries();

  const handleRefresh = () => {
    // Refetch specific query
    queryClient.invalidateQueries({ queryKey: ["users"] });

    // Or use utility hook
    invalidateQueries();
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
```

### Custom Query Options

```typescript
// Override default options for specific queries
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: () => api.getUsers(),
  staleTime: 0, // Always fresh
  refetchInterval: 30000, // Refetch every 30 seconds
});
```

## DevTools

React Query DevTools are available in development:

- **Query Explorer**: View all active queries
- **Cache Inspector**: Examine cached data
- **Mutation Timeline**: Track mutation history
- **Performance Metrics**: Monitor query performance

## Best Practices

1. **Use consistent query keys** for better cache management
2. **Implement proper error boundaries** for error handling
3. **Use optimistic updates** for better UX
4. **Leverage background refetching** for data freshness
5. **Implement proper loading states** for better UX

## Future Enhancements

- [ ] **Infinite queries** for pagination
- [ ] **Offline support** with persistence
- [ ] **Real-time updates** with WebSockets
- [ ] **Advanced caching strategies**
- [ ] **Query prefetching** for better performance
