import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import { ExpirationCountdown } from "./ExpirationCountdown";
import type { Deployment } from "@/types/deployment";
import { Eye, GitBranch, GitCommit, Clock, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useExtendDeployment, isDeploymentActive } from "@/hooks/useDeployments";
import { toast } from "sonner";

interface DeploymentCardProps {
  deployment: Deployment;
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const navigate = useNavigate();
  const extendMutation = useExtendDeployment();
  
  const createdAt = deployment.created_at
    ? new Date(deployment.created_at)
    : null;
    
  const isActive = isDeploymentActive(deployment.status || "");
  const canExtend = deployment.can_extend ?? (isActive && (deployment.extended_count ?? 0) < 3);

  const handleExtend = async () => {
    if (!deployment.id) return;
    
    try {
      await extendMutation.mutateAsync(deployment.id);
      toast.success("Deployment extended by 6 hours");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to extend deployment");
    }
  };

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

        {/* TTL Section - only show for active or expired deployments */}
        {(deployment.expires_at || deployment.status === "EXPIRED") && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExpirationCountdown expiresAt={deployment.expires_at} />
                {(deployment.extended_count ?? 0) > 0 && (
                  <span className="text-xs text-gray-500">
                    Extended {deployment.extended_count}x
                  </span>
                )}
              </div>
              
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtend}
                  disabled={!canExtend || extendMutation.isPending}
                  className="h-7 text-xs"
                >
                  {extendMutation.isPending ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  +6h
                </Button>
              )}
            </div>
            
            {!canExtend && isActive && (
              <p className="text-xs text-gray-400 mt-1">
                Max extensions reached (3)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
