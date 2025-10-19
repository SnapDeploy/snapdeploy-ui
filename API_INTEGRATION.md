# API Integration with OpenAPI Schema

This document describes the automatic API integration setup that generates TypeScript types and API clients from the OpenAPI schema.

## Overview

The dashboard automatically generates type-safe API clients from the [SnapDeploy Core API OpenAPI schema](https://github.com/SnapDeploy/snapdeploy-core/blob/main/api/openapi.yaml).

## Generated Files

```
src/lib/api/generated/
├── types.ts          # Generated TypeScript types from OpenAPI schema
├── client.ts         # OpenAPI-fetch client configuration
├── service.ts        # High-level API service class
└── index.ts          # Exports all API-related modules
```

## Features

### 🔄 Automatic Code Generation

- **TypeScript Types**: Fully typed interfaces for all API endpoints
- **API Client**: Type-safe HTTP client with automatic request/response validation
- **Service Layer**: High-level methods for common API operations

### 🔐 Authentication Integration

- **Clerk Integration**: Automatic JWT token handling
- **Auto-refresh**: Tokens are automatically included in API requests
- **Error Handling**: Graceful handling of authentication errors

### 📡 API Endpoints

Based on the OpenAPI schema, the following endpoints are available:

#### Health

- `GET /health` - Health check endpoint

#### Authentication

- `GET /auth/me` - Get current user information

#### User Management

- `GET /users` - List users (with pagination)
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## Usage

### 1. Using the API Service

```typescript
import { useApi } from "@/hooks/useApi";

function MyComponent() {
  const api = useApi();

  // The API service automatically handles authentication
  const fetchUser = async () => {
    try {
      const user = await api.getCurrentUser();
      console.log(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
}
```

### 2. Direct API Client Usage

```typescript
import { apiClient, getAuthHeaders } from "@/lib/api/generated";

// For custom requests
const { data, error } = await apiClient.GET("/users", {
  headers: getAuthHeaders(token),
  params: { query: { page: 1, limit: 10 } },
});
```

### 3. Type Safety

```typescript
import type { User, UpdateUserRequest } from "@/lib/api/generated";

// All types are automatically generated and type-safe
const user: User = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "user@example.com",
  username: "johndoe",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
```

### API Base URLs

The system supports multiple environments:

- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://api.snapdeploy.com/v1`

## Code Generation

### Regenerating API Types

To regenerate the API types when the OpenAPI schema changes:

```bash
# Generate once
pnpm run generate:api

# Watch for changes (development)
pnpm run generate:api:watch
```

### Script Details

The generation script (`scripts/generate-api.ts`):

1. **Fetches** the OpenAPI schema from the GitHub repository
2. **Generates** TypeScript types using `openapi-typescript`
3. **Creates** a type-safe API client using `openapi-fetch`
4. **Builds** a service layer with high-level methods
5. **Exports** all generated code for easy importing

## Error Handling

The API service includes comprehensive error handling:

```typescript
try {
  const user = await api.getCurrentUser();
} catch (error) {
  // Handle different error types
  if (error.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.status === 404) {
    // Not found
  } else {
    // Other errors
  }
}
```

## Authentication Flow

1. **User signs in** via Clerk
2. **JWT token** is automatically obtained
3. **API service** is configured with the token
4. **All API requests** include the Bearer token
5. **Token refresh** is handled automatically by Clerk

## Type Safety Benefits

- ✅ **Compile-time validation** of API requests and responses
- ✅ **Auto-completion** for all API endpoints and parameters
- ✅ **Type checking** for request bodies and query parameters
- ✅ **Automatic updates** when the API schema changes
- ✅ **No runtime errors** from incorrect API usage

## Integration with Dashboard

The ProfilePage demonstrates the integration:

- **Loading states** while fetching data
- **Error handling** for API failures
- **Fallback data** from Clerk when API is unavailable
- **Real-time updates** when authentication state changes

## Development Workflow

1. **Backend changes** the OpenAPI schema
2. **Run generation script** to update types
3. **TypeScript compiler** catches any breaking changes
4. **Update components** to use new API features
5. **Test integration** with real API endpoints

## Troubleshooting

### Common Issues

1. **API not responding**: Check `VITE_API_URL` environment variable
2. **Authentication errors**: Verify Clerk configuration
3. **Type errors**: Regenerate API types with `pnpm run generate:api`
4. **CORS issues**: Ensure backend allows frontend origin

### Debug Mode

Enable debug logging by setting:

```env
VITE_DEBUG_API=true
```

This will log all API requests and responses to the console.

## Future Enhancements

- [ ] **Caching layer** for API responses
- [ ] **Optimistic updates** for better UX
- [ ] **Request deduplication** to prevent duplicate calls
- [ ] **Retry logic** for failed requests
- [ ] **Offline support** with service workers

