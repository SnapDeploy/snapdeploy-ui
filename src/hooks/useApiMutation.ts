import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ApiMutationOptions<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  successDescription?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string | ((error: unknown, variables: TVariables) => string);
  errorDescription?: string | ((error: unknown, variables: TVariables) => string);
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * A wrapper around useMutation that automatically handles toast notifications
 * for success and error states.
 *
 * @example
 * const syncMutation = useApiMutation({
 *   mutationFn: (userId: string) => apiService.syncUserRepositories(userId),
 *   successMessage: "Repositories synced successfully!",
 *   successDescription: "Your GitHub repositories have been updated.",
 * });
 */
export function useApiMutation<TData = unknown, TError = unknown, TVariables = void>({
  mutationFn,
  onSuccess,
  onError,
  successMessage,
  successDescription,
  errorMessage = "An error occurred",
  errorDescription,
  showSuccessToast = true,
  showErrorToast = true,
}: ApiMutationOptions<TData, TError, TVariables>) {
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Show success toast
      if (showSuccessToast) {
        const message = typeof successMessage === "function" 
          ? successMessage(data, variables)
          : successMessage || "Operation completed successfully";
        
        const description = typeof successDescription === "function"
          ? successDescription(data, variables)
          : successDescription;

        toast.success(message, description ? { description } : undefined);
      }

      // Call custom success handler
      onSuccess?.(data, variables);
    },
    onError: (error: unknown, variables) => {
      // Show error toast
      if (showErrorToast) {
        // Extract error message from various error formats
        const errorObj = error as { error?: string; message?: string };
        const defaultErrorMsg = errorObj?.message || errorObj?.error || "Unknown error";
        
        const message = typeof errorMessage === "function"
          ? errorMessage(error, variables)
          : errorMessage;

        const description = typeof errorDescription === "function"
          ? errorDescription(error, variables)
          : (errorDescription || defaultErrorMsg);

        // Handle specific error types
        if (description.includes("github_not_connected") || 
            description.includes("GitHub account not connected")) {
          toast.warning("GitHub account not connected", {
            description: "Please connect your GitHub account in your profile settings first.",
          });
        } else if (description.includes("unauthorized") || description.includes("401")) {
          toast.error("Authentication error", {
            description: "Please sign in again.",
          });
        } else if (description.includes("403")) {
          toast.error("Permission denied", {
            description: "You don't have permission to perform this action.",
          });
        } else if (description.includes("404")) {
          toast.error("Not found", {
            description: "The requested resource was not found.",
          });
        } else {
          toast.error(message, { description });
        }
      }

      // Call custom error handler
      onError?.(error as TError, variables);
    },
  });
}

