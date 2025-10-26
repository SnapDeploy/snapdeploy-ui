import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, GitBranch, Settings, Plus, RefreshCw } from "lucide-react";
import { apiService } from "@/lib/api/generated/service";
import { useUser } from "@/hooks/useUser";
import { useApiMutation } from "@/hooks/useApiMutation";

const actions = [
  {
    title: "New Deployment",
    description: "Deploy a new version",
    icon: Rocket,
    variant: "default" as const,
  },
  {
    title: "Create Branch",
    description: "Start a new feature",
    icon: GitBranch,
    variant: "outline" as const,
  },
  {
    title: "Add Service",
    description: "Configure new service",
    icon: Plus,
    variant: "outline" as const,
  },
  {
    title: "Configure",
    description: "Update settings",
    icon: Settings,
    variant: "outline" as const,
  },
];

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

  console.log(user);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Sync Repositories Button */}
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

          {/* Other Actions */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant={action.variant}
                  className="h-auto flex-col items-start gap-2 p-4"
                >
                  <ActionIcon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-xs font-normal opacity-70">
                      {action.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
