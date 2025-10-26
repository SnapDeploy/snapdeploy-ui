import { useApiMutation } from "./useApiMutation";
import { useApi } from "./useApi";
import { useInvalidateProjectQueries } from "./useApiQueries";
import type { CreateProjectRequest, UpdateProjectRequest } from "@/lib/api/generated/service";

export function useCreateProject(userId: string) {
  const { apiService } = useApi();
  const invalidateProjects = useInvalidateProjectQueries();

  return useApiMutation<unknown, unknown, CreateProjectRequest>({
    mutationFn: (request) => apiService.createProject(userId, request),
    successMessage: "Project created successfully!",
    successDescription: "Your project has been created and is ready to deploy.",
    errorMessage: "Failed to create project",
    onSuccess: () => {
      invalidateProjects(userId);
    },
  });
}

export function useUpdateProject(userId: string) {
  const { apiService } = useApi();
  const invalidateProjects = useInvalidateProjectQueries();

  return useApiMutation<unknown, unknown, { projectId: string; request: UpdateProjectRequest }>({
    mutationFn: ({ projectId, request }) => apiService.updateProject(projectId, request),
    successMessage: "Project updated successfully!",
    successDescription: "Your project settings have been saved.",
    errorMessage: "Failed to update project",
    onSuccess: () => {
      invalidateProjects(userId);
    },
  });
}

export function useDeleteProject(userId: string) {
  const { apiService } = useApi();
  const invalidateProjects = useInvalidateProjectQueries();

  return useApiMutation<unknown, unknown, string>({
    mutationFn: (projectId) => apiService.deleteProject(projectId),
    successMessage: "Project deleted successfully!",
    successDescription: "Your project has been removed.",
    errorMessage: "Failed to delete project",
    onSuccess: () => {
      invalidateProjects(userId);
    },
  });
}
