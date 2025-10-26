import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiService } from '@/lib/api/generated';

export function useApi() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const setupApiAuth = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            apiService.setAuthToken(token);
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
      } else if (isLoaded && !isSignedIn) {
        apiService.clearAuthToken();
      }
    };

    setupApiAuth();
  }, [getToken, isLoaded, isSignedIn]);

  return {apiService, isSignedIn};
}

