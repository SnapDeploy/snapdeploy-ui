import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  GitBranch,
  ExternalLink,
  Rocket,
} from "lucide-react";
import { useProject } from "@/hooks/useApiQueries";
import {
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/useProjectMutations";
import { useCurrentUser } from "@/hooks/useApiQueries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateDeploymentDialog } from "@/components/deployment/CreateDeploymentDialog";
import { DeploymentsList } from "@/components/deployment/DeploymentsList";
import { ProjectEnvironmentVariables } from "@/components/project/ProjectEnvironmentVariables";
import { useProjectDeployments } from "@/hooks/useDeployments";
import type { Language } from "@/types";

const LANGUAGES = [
  { value: "NODE", label: "Node.js" },
  { value: "NODE_TS", label: "Node.js + TypeScript" },
  { value: "NEXTJS", label: "Next.js" },
  { value: "GO", label: "Go" },
  { value: "PYTHON", label: "Python" },
] as const;

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: project, isLoading } = useProject(id);
  const { data: deploymentsData, isLoading: deploymentsLoading } =
    useProjectDeployments(id);
  const updateProject = useUpdateProject(user?.id || "");
  const deleteProject = useDeleteProject(user?.id || "");

  const [installCommand, setInstallCommand] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [runCommand, setRunCommand] = useState("");
  const [language, setLanguage] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (project) {
      setInstallCommand(project.install_command || "");
      setBuildCommand(project.build_command || "");
      setRunCommand(project.run_command || "");
      setLanguage(project.language || "");
      setRepositoryUrl(project.repository_url || "");
      setCustomDomain(project.custom_domain || "");
    }
  }, [project]);

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateProject.mutateAsync({
        projectId: id,
        request: {
          repository_url: repositoryUrl,
          install_command: installCommand,
          build_command: buildCommand,
          run_command: runCommand,
          language: language as Language,
          custom_domain: customDomain || undefined,
          require_db: false, // TODO: Add UI for database requirement
          migration_command: undefined,
        },
      });
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProject.mutateAsync(id);
      navigate("/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Project not found
        </h2>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const hasChanges =
    installCommand !== (project.install_command || "") ||
    buildCommand !== (project.build_command || "") ||
    runCommand !== (project.run_command || "") ||
    language !== (project.language || "") ||
    repositoryUrl !== (project.repository_url || "") ||
    customDomain !== (project.custom_domain || "");

  const isFormValid =
    installCommand && runCommand && language && repositoryUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {repositoryUrl.split("/").pop()?.replace(".git", "") || "Project"}
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your project configuration and settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || !isFormValid || updateProject.isPending}
          >
            {updateProject.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Repository Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="repositoryUrl"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
              />
              {project.repository_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(project.repository_url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Build & Runtime Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language/Framework *</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language or framework" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installCommand">Install Command *</Label>
            <Input
              id="installCommand"
              placeholder="e.g., npm install"
              value={installCommand}
              onChange={(e) => setInstallCommand(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Command to install dependencies
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buildCommand">Build Command (Optional)</Label>
            <Input
              id="buildCommand"
              placeholder="e.g., npm run build (leave empty if no build step)"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Command to build your application. Leave empty if your app doesn't need a build step.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="runCommand">Run Command *</Label>
            <Input
              id="runCommand"
              placeholder="e.g., npm start"
              value={runCommand}
              onChange={(e) => setRunCommand(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Command to start your application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="customDomain"
                placeholder="my-app"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">.snapdeploy.app</span>
            </div>
            <p className="text-sm text-gray-500">
              Your app will be available at: <span className="font-mono">{customDomain || project.custom_domain || '[not set]'}.snapdeploy.app</span>
            </p>
            <p className="text-xs text-gray-400">
              Use lowercase letters, numbers, and hyphens only. Changes may require redeployment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deployment URL */}
      {project.deployment_url && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Rocket className="h-5 w-5" />
              Live Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label className="text-blue-900">Your app is deployed at:</Label>
              <div className="flex gap-2">
                <Input
                  value={project.deployment_url}
                  readOnly
                  className="flex-1 bg-white font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(project.deployment_url, "_blank")}
                  className="hover:bg-blue-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {project.custom_domain && (
              <div className="text-sm text-blue-700">
                Custom subdomain: <span className="font-mono font-semibold">{project.custom_domain}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Environment Variables */}
      <ProjectEnvironmentVariables projectId={id!} />

      {/* Project Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Project ID:</span>
            <span className="font-mono text-xs">{project.id}</span>
          </div>
          {project.custom_domain && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Custom Domain:</span>
              <span className="font-mono">{project.custom_domain}.snapdeploy.app</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created:</span>
            <span>
              {new Date(project.created_at || "").toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Updated:</span>
            <span>
              {new Date(project.updated_at || "").toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Deployments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deployments
            </CardTitle>
            <CreateDeploymentDialog projectId={id!} />
          </div>
        </CardHeader>
        <CardContent>
          <DeploymentsList
            deployments={deploymentsData?.deployments || []}
            isLoading={deploymentsLoading}
            emptyMessage="No deployments yet"
            emptyAction={<CreateDeploymentDialog projectId={id!} />}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
