import { useParams, useNavigate } from "react-router-dom";
import { useDeployment } from "@/hooks/useDeployments";
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";
import { DeploymentLogsViewer } from "@/components/deployment/DeploymentLogsViewer";
import { DeploymentStatusBadge } from "@/components/deployment/DeploymentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Clock,
  GitBranch,
  GitCommit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DeploymentViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deployment, isLoading } = useDeployment(id);
  const { deleteDeployment } = useDeploymentMutations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading deployment...</p>
        </div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Deployment Not Found</h2>
          <p className="text-gray-500 mb-4">
            The deployment you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/deployments")}>
            Back to Deployments
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this deployment?")) {
      deleteDeployment.mutate(deployment.id!, {
        onSuccess: () => {
          navigate(`/projects/${deployment.project_id}`);
        },
      });
    }
  };

  const createdAt = deployment.created_at
    ? new Date(deployment.created_at)
    : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/projects/${deployment.project_id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteDeployment.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Deployment Details</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <GitCommit className="h-4 w-4" />
                  <code>{deployment.commit_hash}</code>
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  <span>{deployment.branch}</span>
                </div>
                {createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <DeploymentStatusBadge status={deployment.status!} />
          </div>
        </div>
      </div>

      {/* Logs Viewer - Full Height */}
      <div className="flex-1 overflow-hidden">
        <DeploymentLogsViewer
          deploymentId={deployment.id!}
          className="h-full"
        />
      </div>
    </div>
  );
}
