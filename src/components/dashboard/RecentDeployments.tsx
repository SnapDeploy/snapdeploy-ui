import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useUserDeployments } from "@/hooks/useDeployments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeploymentStatusBadge } from "@/components/deployment/DeploymentStatusBadge";
import { GitCommit, GitBranch, Clock, ArrowRight, Rocket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentDeployments() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data, isLoading } = useUserDeployments(user?.id, 1, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const deployments = data?.deployments || [];

  if (deployments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Rocket className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-2">No deployments yet</p>
            <p className="text-sm text-gray-400">
              Create a project and deploy it to see activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Deployments</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/deployments")}
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deployments.map((deployment) => {
            const createdAt = deployment.created_at
              ? new Date(deployment.created_at)
              : null;

            return (
              <div
                key={deployment.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                onClick={() => navigate(`/deployments/${deployment.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GitCommit className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <code className="text-sm font-mono truncate">
                      {deployment.commit_hash}
                    </code>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      <span>{deployment.branch}</span>
                    </div>
                    {createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <DeploymentStatusBadge status={deployment.status!} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

