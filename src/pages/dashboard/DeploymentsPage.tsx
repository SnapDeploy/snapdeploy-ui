import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus, GitBranch, Clock } from "lucide-react";
import { useCurrentUser } from "@/hooks/useApiQueries";

interface Deployment {
  id: string;
  name: string;
  environment: string;
  version: string;
  status: "success" | "pending" | "failed";
  branch: string;
  deployedAt: string;
}

const mockDeployments: Deployment[] = [
  {
    id: "1",
    name: "snapdeploy-ui",
    environment: "Production",
    version: "v1.2.3",
    status: "success",
    branch: "main",
    deployedAt: "2 minutes ago",
  },
  {
    id: "2",
    name: "snapdeploy-core",
    environment: "Staging",
    version: "v2.0.1",
    status: "success",
    branch: "develop",
    deployedAt: "15 minutes ago",
  },
  {
    id: "3",
    name: "snapdeploy-api",
    environment: "Development",
    version: "v1.5.0",
    status: "pending",
    branch: "feature/new-api",
    deployedAt: "1 hour ago",
  },
  {
    id: "4",
    name: "snapdeploy-worker",
    environment: "Production",
    version: "v1.0.0",
    status: "failed",
    branch: "main",
    deployedAt: "3 hours ago",
  },
];

const statusConfig = {
  success: { label: "Success", variant: "default" as const },
  pending: { label: "Pending", variant: "secondary" as const },
  failed: { label: "Failed", variant: "destructive" as const },
};

const envConfig = {
  Production: "default" as const,
  Staging: "secondary" as const,
  Development: "outline" as const,
};

export function DeploymentsPage() {
  const { data: user, isLoading, error } = useCurrentUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user data</div>;
  console.log(user);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployments</h1>
          <p className="text-gray-500 mt-1">
            Manage and monitor your application deployments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deployment
        </Button>
      </div>

      {/* Deployments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDeployments.map((deployment) => (
              <div
                key={deployment.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{deployment.name}</h3>
                      <Badge variant={statusConfig[deployment.status].variant}>
                        {statusConfig[deployment.status].label}
                      </Badge>
                      <Badge
                        variant={
                          envConfig[
                            deployment.environment as keyof typeof envConfig
                          ]
                        }
                      >
                        {deployment.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {deployment.branch}
                      </span>
                      <span>{deployment.version}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {deployment.deployedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
