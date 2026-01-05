import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentDeployments } from "@/components/dashboard/RecentDeployments";

export function Overview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening with your deployments.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentDeployments />
        <QuickActions />
      </div>
    </div>
  );
}
