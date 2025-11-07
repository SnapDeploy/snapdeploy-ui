import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useUserDeployments } from "@/hooks/useDeployments";
import { DeploymentsList } from "@/components/deployment/DeploymentsList";

export function DeploymentsPage() {
  const { user } = useUser();
  const { data, isLoading } = useUserDeployments(user?.id, 1, 50);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Deployments</h1>
          <p className="text-gray-500 mt-1">
            View and manage all your deployments across all projects
          </p>
        </div>
      </div>

      {/* Deployments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Your Deployments ({data?.pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeploymentsList
            deployments={data?.deployments || []}
            isLoading={isLoading}
            emptyMessage="No deployments yet"
            emptyAction={
              <p className="text-sm text-gray-500">
                Go to a project and create a deployment to see it here
              </p>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
