import { createContext, useContext, type ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { apiService, type User } from "../lib/api/generated/service";

interface UserContextValue {
  user: User | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // Set auth token when it becomes available
  useEffect(() => {
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) {
          apiService.setAuthToken(token);
        }
      });
    } else {
      apiService.clearAuthToken();
    }
  }, [isSignedIn, getToken]);

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      apiService.setAuthToken(token);
      return apiService.getCurrentUser();
    },
    enabled: isLoaded && isSignedIn,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("user", user);
  const value: UserContextValue = {
    user: isSignedIn ? user : null,
    isLoading: !isLoaded || (isSignedIn && isLoading),
    isError,
    error: error as Error | null,
    refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
