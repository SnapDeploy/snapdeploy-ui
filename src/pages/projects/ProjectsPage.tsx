import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus, Settings, ExternalLink } from "lucide-react";
import { useUserProjects } from "@/hooks/useApiQueries";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import type { Project } from "@/lib/api/generated/service";

const LANGUAGE_COLORS = {
  NODE: "bg-green-100 text-green-800",
  NODE_TS: "bg-blue-100 text-blue-800",
  NEXTJS: "bg-black text-white",
  GO: "bg-cyan-100 text-cyan-800",
  PYTHON: "bg-yellow-100 text-yellow-800",
} as const;

export function ProjectsPage() {
  const navigate = useNavigate();
  // Use the user hook that gets user from context (no API call needed!)
  const { user, isLoading: userLoading } = useUser();
  
  console.log('[PERF] ProjectsPage render - user:', user?.id, 'loading:', userLoading);
  
  // Load projects immediately with user ID from context
  const { data: projectsData, isLoading: projectsLoading } = useUserProjects(
    user?.id
  );

  const projects: Project[] = projectsData?.projects || [];
  
  console.log('[PERF] ProjectsPage - projectsLoading:', projectsLoading, 'projects count:', projects.length);

  if (userLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            Manage your deployment projects and configurations
          </p>
        </div>
        <Button onClick={() => navigate("/projects/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first project
              </p>
              <Button onClick={() => navigate("/projects/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {project.repository_url
                            ?.split("/")
                            .pop()
                            ?.replace(".git", "") || "Project"}
                        </h3>
                        <Badge
                          className={
                            LANGUAGE_COLORS[
                              project.language as keyof typeof LANGUAGE_COLORS
                            ]
                          }
                        >
                          {project.language}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {project.repository_url}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Install: {project.install_command}</span>
                        <span>•</span>
                        <span>Build: {project.build_command}</span>
                        <span>•</span>
                        <span>Run: {project.run_command}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
