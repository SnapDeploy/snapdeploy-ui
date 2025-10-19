import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Package } from "lucide-react";

interface Activity {
  id: string;
  type: "deployment" | "update" | "error";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "deployment",
    title: "Production Deploy",
    description: "snapdeploy-ui v1.2.3",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    type: "deployment",
    title: "Staging Deploy",
    description: "snapdeploy-core v2.0.1",
    timestamp: "15 minutes ago",
    status: "success",
  },
  {
    id: "3",
    type: "deployment",
    title: "Dev Deploy",
    description: "snapdeploy-api v1.5.0",
    timestamp: "1 hour ago",
    status: "pending",
  },
  {
    id: "4",
    type: "error",
    title: "Build Failed",
    description: "snapdeploy-worker v1.0.0",
    timestamp: "3 hours ago",
    status: "failed",
  },
];

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    badge: "default" as const,
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    badge: "destructive" as const,
  },
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    badge: "secondary" as const,
  },
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const config = statusConfig[activity.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <div className={`rounded-full p-2 ${config.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge variant={config.badge} className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

