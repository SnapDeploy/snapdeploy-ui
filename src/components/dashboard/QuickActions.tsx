import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, GitBranch, Settings, Plus } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

