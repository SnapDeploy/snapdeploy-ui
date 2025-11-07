import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjectDeployments } from "@/hooks/useDeployments";
import { DeploymentsList } from "@/components/deployment/DeploymentsList";
import { CreateDeploymentDialog } from "@/components/deployment/CreateDeploymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DeploymentsListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useProjectDeployments(projectId, page, limit);

  const totalPages = data?.pagination?.total_pages || 0;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Deployments</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {data?.pagination?.total || 0} total deployments
              </p>
            </div>
            {projectId && <CreateDeploymentDialog projectId={projectId} />}
          </div>
        </CardHeader>

        <CardContent>
          <DeploymentsList
            deployments={data?.deployments || []}
            isLoading={isLoading}
            emptyAction={
              projectId && <CreateDeploymentDialog projectId={projectId} />
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

