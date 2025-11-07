import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import type { Deployment } from "@/types/deployment";
import { Eye, GitBranch, GitCommit, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DeploymentCardProps {
  deployment: Deployment;
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const navigate = useNavigate();
  const createdAt = deployment.created_at
    ? new Date(deployment.created_at)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DeploymentStatusBadge status={deployment.status!} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/deployments/${deployment.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Logs
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <GitCommit className="h-4 w-4 text-gray-500" />
            <code className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {deployment.commit_hash}
            </code>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-gray-500" />
            <span>{deployment.branch}</span>
          </div>

          {createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
