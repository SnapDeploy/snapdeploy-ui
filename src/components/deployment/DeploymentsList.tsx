import { DeploymentCard } from "./DeploymentCard";
import type { Deployment } from "@/types/deployment";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket } from "lucide-react";

interface DeploymentsListProps {
  deployments: Deployment[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function DeploymentsList({
  deployments,
  isLoading = false,
  emptyMessage = "No deployments yet",
  emptyAction,
}: DeploymentsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!deployments || deployments.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">{emptyMessage}</p>
          <p className="text-sm text-gray-500 mb-4">
            Create your first deployment to get started!
          </p>
          {emptyAction}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {deployments.map((deployment) => (
        <DeploymentCard key={deployment.id} deployment={deployment} />
      ))}
    </div>
  );
}
