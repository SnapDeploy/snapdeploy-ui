import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { apiService } from "@/lib/api/generated/service";
import { useUser } from "@/hooks/useUser";
import { useApiMutation } from "@/hooks/useApiMutation";

export function QuickActions() {
  const { user } = useUser();

  const syncMutation = useApiMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not found");
      }
      return apiService.syncUserRepositories(user.id);
    },
    successMessage: "Repositories synced successfully!",
    successDescription: "Your GitHub repositories have been updated.",
    errorMessage: "Failed to sync repositories",
  });

  const handleSyncRepositories = () => {
    syncMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="default"
          className="h-auto flex-col items-start gap-2 p-4 w-full"
          onClick={handleSyncRepositories}
          disabled={syncMutation.isPending || !user}
        >
          <div className="flex items-center gap-2 w-full">
            <RefreshCw
              className={`h-5 w-5 ${
                syncMutation.isPending ? "animate-spin" : ""
              }`}
            />
            <div className="text-left flex-1">
              <p className="font-semibold">
                {syncMutation.isPending ? "Syncing..." : "Sync Repositories"}
              </p>
              <p className="text-xs font-normal opacity-70">
                Sync from GitHub
              </p>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
