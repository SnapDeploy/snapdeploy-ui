import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentDeployments } from "@/components/dashboard/RecentDeployments";
import { Rocket, Package, CheckCircle, TrendingUp } from "lucide-react";

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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Deployments"
          value="24"
          icon={Rocket}
          description="Last 30 days"
          trend={{ value: "12%", isPositive: true }}
        />
        <StatsCard
          title="Active Services"
          value="8"
          icon={Package}
          description="Currently running"
        />
        <StatsCard
          title="Success Rate"
          value="98.5%"
          icon={CheckCircle}
          description="Last 30 days"
          trend={{ value: "2.1%", isPositive: true }}
        />
        <StatsCard
          title="Avg Deploy Time"
          value="3.2m"
          icon={TrendingUp}
          description="Average duration"
          trend={{ value: "0.5m", isPositive: false }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentDeployments />
        <QuickActions />
      </div>

      <div className="grid gap-6">
        <RecentActivity />
      </div>
    </div>
  );
}
