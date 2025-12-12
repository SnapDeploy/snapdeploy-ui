import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeployment } from "@/hooks/useDeployments";
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";
import { useProject } from "@/hooks/useApiQueries";
import { DeploymentLogsViewer } from "@/components/deployment/DeploymentLogsViewer";
import { DeploymentStatusBadge } from "@/components/deployment/DeploymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Clock,
  GitBranch,
  GitCommit,
  Database,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DeploymentViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deployment, isLoading } = useDeployment(id);
  const { deleteDeployment } = useDeploymentMutations();

  // Fetch project to get database_url
  const { data: project } = useProject(deployment?.project_id);

  // One-time database URL reveal state
  const [urlRevealed, setUrlRevealed] = useState(false);
  const [urlVisible, setUrlVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check localStorage for whether this deployment's DB URL was already revealed
  const storageKey = `db_url_revealed_${id}`;

  useEffect(() => {
    if (id) {
      const wasRevealed = localStorage.getItem(storageKey) === "true";
      setUrlRevealed(wasRevealed);
    }
  }, [id, storageKey]);

  // Determine if we should show the reveal card
  const isDeployed = deployment?.status === "DEPLOYED";
  const hasDatabase = project?.require_db && project?.database_url;
  const canReveal = isDeployed && hasDatabase && !urlRevealed;

  const handleReveal = () => {
    setUrlVisible(true);
    setUrlRevealed(true);
    localStorage.setItem(storageKey, "true");
  };

  const handleCopy = async () => {
    if (project?.database_url) {
      await navigator.clipboard.writeText(project.database_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

      {/* One-Time Database URL Reveal */}
      {canReveal && (
        <div className="border-b bg-amber-50 p-4">
          <div className="container mx-auto">
            <Card className="border-amber-300 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Database className="h-5 w-5" />
                  Database Connection - One-Time Reveal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">
                      Important Security Notice
                    </p>
                    <p>
                      Your database credentials will only be shown{" "}
                      <strong>once</strong>. After you reveal and dismiss this
                      card, the credentials will be hidden permanently. Make
                      sure to copy and store them securely.
                    </p>
                  </div>
                </div>

                {!urlVisible ? (
                  <Button
                    onClick={handleReveal}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Reveal Database URL
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white p-3 rounded border text-sm font-mono break-all">
                        {project?.database_url}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-amber-700">
                      This URL is also injected as{" "}
                      <code className="bg-amber-100 px-1 rounded">
                        DATABASE_URL
                      </code>{" "}
                      environment variable in your app.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Already Revealed Notice */}
      {isDeployed && hasDatabase && urlRevealed && (
        <div className="border-b bg-gray-50 p-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 text-gray-600">
              <EyeOff className="h-5 w-5" />
              <span className="text-sm">
                Database credentials were revealed previously. Your app receives{" "}
                <code className="bg-gray-200 px-1 rounded text-xs">
                  DATABASE_URL
                </code>{" "}
                automatically.
              </span>
            </div>
          </div>
        </div>
      )}

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
